const axios = require('axios');
const { sequelize, Category, Event } = require('../models');
const { parseISO, addDays, format, subDays } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz'); // Note: date-fns-tz might be needed, or standard date-fns

// ------------------------------------------------------------
// Legacy Logic Port from aktualisieren.php
// ------------------------------------------------------------

/** Windows-TZ -> IANA */
function mapWindowsTzToIana(winTz) {
    const map = {
        'W. Europe Standard Time': 'Europe/Berlin',
        'Central Europe Standard Time': 'Europe/Berlin',
        'Romance Standard Time': 'Europe/Paris',
        'UTC': 'UTC',
        'GMT Standard Time': 'Europe/London',
    };
    winTz = winTz ? winTz.trim() : '';
    if (winTz === '') return 'Europe/Berlin';
    if (map[winTz]) return map[winTz];
    return (winTz.includes('/')) ? winTz : 'Europe/Berlin';
}

/** Normalize line endings + ICS Unfolding */
function normalizeAndUnfold(ics) {
    ics = ics.replace(/\r\n/g, "\n");
    return ics.replace(/\n[ \t]/g, '');
}

/** Extract TZID from Key */
function extractTzidFromKey(key) {
    const parts = key.split(':', 2);
    const front = parts[0];
    if (!front.toUpperCase().includes('TZID=')) return null;

    const params = front.split(';');
    for (const p of params) {
        if (p.trim().toUpperCase().startsWith('TZID=')) {
            return p.trim().substring(5);
        }
    }
    return null;
}

/** Pick first Key/Value with prefix */
function pickIcs(evt, prefix) {
    // evt is an object { key: value }
    // In the PHP version, duplicate keys (like multiple ATTENDEE) might be lost if using a simple object.
    // However, for DTSTART/DTEND, they are usually unique.
    // Accessing object keys:
    for (const k in evt) {
        if (k.toUpperCase().startsWith(prefix.toUpperCase())) {
            return [k, evt[k]];
        }
    }
    return ['', ''];
}

/** Parse ICS Date -> { allDay, dt (Date), tz } */
function parseIcsDate(key, val, defaultTz = 'Europe/Berlin') {
    // 1. All Day (YYYYMMDD)
    if (/^\d{8}$/.test(val)) {
        // Parse as local date at 00:00 in defaultTz
        const y = parseInt(val.substring(0, 4));
        const m = parseInt(val.substring(4, 6)) - 1;
        const d = parseInt(val.substring(6, 8));
        const dt = new Date(Date.UTC(y, m, d)); // Use UTC for internal representation of "date only" to avoid shifts
        return { allDay: true, dt: dt, tz: defaultTz };
    }

    const tzid = extractTzidFromKey(key);
    const iana = mapWindowsTzToIana(tzid || defaultTz);

    // 2. UTC with Z
    if (/^\d{8}T\d{6}Z$/.test(val)) {
        // Parse as UTC
        const y = parseInt(val.substring(0, 4));
        const m = parseInt(val.substring(4, 6)) - 1;
        const d = parseInt(val.substring(6, 8));
        const h = parseInt(val.substring(9, 11));
        const min = parseInt(val.substring(11, 13));
        const s = parseInt(val.substring(13, 15));
        const dt = new Date(Date.UTC(y, m, d, h, min, s));
        return { allDay: false, dt: dt, tz: iana };
    }

    // 3. Local without Z
    if (/^\d{8}T\d{6}$/.test(val)) {
        // Treat as local time in 'iana' timezone
        // For simplicity in JS, we often treat "Floating" time as local. 
        // But to be precise, we need to construct the date.
        const y = parseInt(val.substring(0, 4));
        const m = parseInt(val.substring(4, 6)) - 1;
        const d = parseInt(val.substring(6, 8));
        const h = parseInt(val.substring(9, 11));
        const min = parseInt(val.substring(11, 13));
        const s = parseInt(val.substring(13, 15));

        // This is tricky in JS without a library like moment-timezone or luxon.
        // We will assume server local time is acceptable OR use a library if strictly needed.
        // For now, let's construct it as a basic Date.
        const dt = new Date(y, m, d, h, min, s);
        return { allDay: false, dt: dt, tz: iana };
    }

    return { allDay: false, dt: null, tz: iana };
}

/** Parse ICS String to Events Array */
function parseIcsToEvents(icsRaw) {
    const ics = normalizeAndUnfold(icsRaw);
    const chunks = ics.split('BEGIN:');
    const events = [];

    for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (!trimmed) continue;
        if (!trimmed.startsWith("VEVENT")) continue;

        const lines = trimmed.split("\n");
        const evt = {};

        for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine === 'END:VEVENT') break;

            const parts = cleanLine.split(':');
            if (parts.length >= 2) {
                const k = parts.shift(); // First part is key (can include params)
                const v = parts.join(':'); // Rest is value (can include :)
                evt[k.trim()] = v.trim();
            }
        }
        if (Object.keys(evt).length > 0) events.push(evt);
    }
    return events;
}

/** Safe UID Generation */
const crypto = require('crypto');
function safeUid(evt, startStr, endStr) {
    if (evt['UID']) return evt['UID'].trim();
    const sum = evt['SUMMARY'] || '';
    const loc = evt['LOCATION'] || '';
    return crypto.createHash('md5').update(`${sum}|${startStr}|${endStr}|${loc}`).digest('hex');
}

const { GlobalSettings } = require('../models');

/** Main Sync Function */
async function syncAllCalendars() {
    const logs = [];
    const log = (msg) => {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${msg}`;
        console.log(entry);
        logs.push(entry);
    };

    log('Starting sync job...');

    // 1. Fetch Categories (Calendars)
    const categories = await Category.findAll();

    // 2. Fetch configured holiday/vacation URLs from GlobalSettings
    const settings = await GlobalSettings.findAll();
    const settingMap = {};
    settings.forEach(s => settingMap[s.key] = s.value);

    // Add virtual categories for Holidays/Vacations if configured
    const vacationCat = categories.find(c => c.title === 'Ferien') || categories.find(c => c.title.toLowerCase().includes('ferien'));
    const holidayCat = categories.find(c => c.title === 'Feiertage') || categories.find(c => c.title.toLowerCase().includes('feiertag'));
    const fallbackId = categories.length > 0 ? categories[0].id : 1;

    if (settingMap['vacation_ics_url']) {
        categories.push({
            id: 'vacation_settings',
            title: 'Ferien (Settings)',
            icsUrl: settingMap['vacation_ics_url'],
            isPseudo: true,
            targetCategoryId: vacationCat ? vacationCat.id : fallbackId
        });
    }
    if (settingMap['holiday_ics_url']) {
        categories.push({
            id: 'holiday_settings',
            title: 'Feiertage (Settings)',
            icsUrl: settingMap['holiday_ics_url'],
            isPseudo: true,
            targetCategoryId: holidayCat ? holidayCat.id : fallbackId
        });
    }

    for (const cat of categories) {
        log(`Processing category: ${cat.title} (${cat.icsUrl})`);

        if (!cat.icsUrl || cat.icsUrl === 'internal') {
            log(`Skipping category ${cat.title} (No URL or internal)`);
            continue;
        }

        try {
            // Fetch ICS
            const response = await axios.get(cat.icsUrl, {
                timeout: 15000,
                validateStatus: null, // Don't throw on 404/500 to handle manually
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ics-importer/1.1-node)' }
            });

            if (response.status !== 200) {
                log(`HTTP Error ${response.status} for ${cat.title}`);
                continue;
            }

            const events = parseIcsToEvents(response.data);
            log(`Found ${events.length} events for ${cat.title}`);

            if (events.length === 0) continue;

            const transaction = await sequelize.transaction();

            try {
                const eventRecords = [];

                for (const evt of events) {
                    const [startKey, startRaw] = pickIcs(evt, 'DTSTART');
                    const [endKey, endRaw] = pickIcs(evt, 'DTEND');

                    const pStart = startRaw ? parseIcsDate(startKey, startRaw) : { allDay: false, dt: null };
                    const pEnd = endRaw ? parseIcsDate(endKey, endRaw) : { allDay: false, dt: null };

                    const isAllDay = pStart.allDay && pEnd.allDay;

                    let startDt, endDt;
                    let ganztag = false;

                    if (isAllDay) {
                        startDt = pStart.dt;
                        endDt = pEnd.dt;
                        // Legacy Logic: ICS End is exclusive -> subtract 1 day for storage/display
                        if (endDt) {
                            endDt = subDays(endDt, 1);
                        }
                        ganztag = true;
                    } else {
                        startDt = pStart.dt;
                        endDt = pEnd.dt;
                        ganztag = false;
                    }

                    const startStr = startDt ? format(startDt, "yyyyMMdd'T'HHmm") : '';
                    const endStr = endDt ? format(endDt, "yyyyMMdd'T'HHmm") : '';

                    const [uidKey, uidRaw] = pickIcs(evt, 'UID');
                    const [sumKey, sumRaw] = pickIcs(evt, 'SUMMARY');
                    const [descKey, descRaw] = pickIcs(evt, 'DESCRIPTION');
                    const [locKey, locRaw] = pickIcs(evt, 'LOCATION');

                    const title = sumRaw || '';
                    const description = descRaw ? descRaw.replace(/\s\s+/g, ' ').trim() : '';
                    const location = locRaw || '';

                    let uid = uidRaw ? uidRaw.trim() : '';
                    if (!uid) {
                        uid = crypto.createHash('md5').update(`${title}|${startStr}|${endStr}|${location}`).digest('hex');
                    }

                    // Determine Type and Category
                    let type = 'default';
                    let categoryId = cat.id;

                    if (cat.isPseudo) {
                        categoryId = cat.targetCategoryId;
                        if (cat.title.includes('Ferien')) {
                            type = 'vacation';
                        } else if (cat.title.includes('Feiertage')) {
                            type = 'holiday';
                        }
                    } else {
                        // Regular category - check if it's one of the special ones by title if ID mismatch
                        if (cat.title.toLowerCase().includes('ferien')) type = 'vacation';
                        if (cat.title.toLowerCase().includes('feiertag')) type = 'holiday';
                    }

                    if (startDt && endDt) { // Only add if dates are valid
                        eventRecords.push({
                            id: uid,
                            title: title,
                            start: startDt, // Internal DB usage (DATE type)
                            end: endDt,     // Internal DB usage (DATE type)
                            description: description,
                            location: location,
                            categoryId: categoryId,
                            isAllDay: ganztag,
                            type: type
                        });
                    }
                }

                if (eventRecords.length > 0) {
                    await Event.bulkCreate(eventRecords, {
                        updateOnDuplicate: ['title', 'start', 'end', 'description', 'location', 'isAllDay', 'type', 'categoryId'],
                        transaction
                    });
                }

                await transaction.commit();
                log(`Successfully saved ${eventRecords.length} events for ${cat.title}`);

            } catch (err) {
                await transaction.rollback();
                log(`DB Error for ${cat.title}: ${err.message}`);
            }

        } catch (err) {
            log(`General Error for ${cat.title}: ${err.message}`);
        }
    }
    log('Sync Job finished.');
    return logs;
}

module.exports = { syncAllCalendars };
