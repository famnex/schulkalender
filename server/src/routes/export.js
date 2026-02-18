const express = require('express');
const router = express.Router();
const { Event, Category, Op, SavedFilter } = require('../models');
const { parseISO, format } = require('date-fns');

// GET /api/export/ics
// Query: categoryId, tags, stufe, token (SavedFilter ID)
// GET /api/export/ics
// Query: categoryIds (comma sep), tags (comma sep), stufe
// GET /api/export/ics
// GET /api/export/ics/schulkalender.ics (for nice URLs)
// Query: categoryIds (comma sep), tags (comma sep), stufe
router.get(['/ics', '/ics/:filename'], async (req, res) => {
    try {
        let { categoryIds, tags, stufe, start, end, token, filters } = req.query;

        // Date Range (Default: -1 month to +12 months)
        let startDate = start ? parseISO(start) : new Date(new Date().setMonth(new Date().getMonth() - 1));
        let endDate = end ? parseISO(end) : new Date(new Date().setMonth(new Date().getMonth() + 12));

        const baseWhere = {
            start: { [Op.lte]: endDate },
            end: { [Op.gte]: startDate }
        };

        let filterGroups = [];

        // 1. Resolve Config (Token or Query)
        if (token) {
            try {
                const saved = await SavedFilter.findByPk(token);
                if (!saved) {
                    return res.status(404).send('Kalender nicht gefunden (Token ungültig)');
                }

                if (saved.config) {
                    // Check if new structured config exists
                    if (saved.config.filters) {
                        try {
                            filterGroups = typeof saved.config.filters === 'string' ? JSON.parse(saved.config.filters) : saved.config.filters;
                        } catch (e) {
                            console.error('Error parsing token filters', e);
                            return res.status(500).send('Fehler in der Kalender-Konfiguration');
                        }
                    } else {
                        // Legacy SavedFilter (flat) -> Convert to logic
                        categoryIds = saved.config.categoryIds;
                        tags = saved.config.tags;
                        stufe = saved.config.stufe;
                    }
                }
            } catch (e) {
                console.error("Error loading token", e);
                return res.status(500).send('Fehler beim Laden des Kalenders');
            }
        } else if (filters) {
            try {
                filterGroups = JSON.parse(filters);
            } catch (e) {
                console.error('Error parsing query filters', e);
            }
        }

        // 2. Build Query
        let where = {};

        if (filterGroups.length > 0) {
            // New Logic: OR between groups
            // Group: { id: 1, tags: [], stufe: '' }
            // If tags empty -> All for this cat.
            // If tags -> Filter desc.
            const groups = filterGroups.map(g => {
                const conditions = { categoryId: g.id };
                const extra = [];

                // Klausuren Stufe
                if (g.id == 5 && g.stufe) { // strict compare if number/string
                    // Klausuren Filter: (Desc LIKE stufe OR Desc LIKE KLA:Nac)
                    extra.push({
                        [Op.or]: [
                            { description: { [Op.like]: `%${g.stufe}%` } },
                            { description: { [Op.like]: 'KLA:Nac%' } }
                        ]
                    });
                }

                // Tags (Whitelist)
                if (g.tags && g.tags.length > 0) {
                    // (Desc LIKE Tag1 OR Desc LIKE Tag2)
                    const tagConds = g.tags.map(t => ({ description: { [Op.like]: `%${t}%` } }));
                    extra.push({ [Op.or]: tagConds });
                }

                if (extra.length > 0) {
                    return { [Op.and]: [conditions, ...extra] };
                }
                return conditions;
            });

            where = {
                [Op.and]: [
                    baseWhere,
                    { [Op.or]: groups }
                ]
            };
            // If user wants Ferien/Feiertage, they must select the category explicitly.
        } else {
            // Legacy Logic (Global AND) or Fallback
            if (!categoryIds && !tags && !token) {
                // No filters -> Return all?
                // Usually blank = blank? Or defaults?
                // Let's return defaults (All).
            }

            const subFilters = [];
            // ... (Only if categoryIds/tags exist) ...
            // Copy existing legacy logic for 'categoryIds', 'tags', 'stufe'
            if (categoryIds) {
                const catList = categoryIds.split(',').filter(c => c !== '0');
                if (catList.length > 0) subFilters.push({ categoryId: { [Op.in]: catList } });
            }
            // Tags, Stufe... (reuse existing block or keep as is? easier to keep existing structure if I can't overwrite easily)
            // But I am rewriting the block.
            // Re-implementing legacy logic briefly:
            if (stufe && stufe !== '0') {
                subFilters.push({
                    [Op.or]: [
                        { categoryId: { [Op.ne]: 5 } },
                        { [Op.and]: [{ categoryId: 5 }, { [Op.or]: [{ description: { [Op.like]: `%${stufe}%` } }, { description: { [Op.like]: 'KLA:Nac%' } }] }] }
                    ]
                });
            }
            if (tags) {
                const tagList = tags.split(',').filter(t => t.trim() !== '');
                if (tagList.length > 0) subFilters.push({ [Op.or]: tagList.map(t => ({ description: { [Op.like]: `%${t}%` } })) });
            }

            if (subFilters.length > 0) {
                where = {
                    [Op.and]: [
                        baseWhere,
                        { [Op.and]: subFilters }
                    ]
                };
            } else {
                // No filters -> Base + Exclude holidays/vacations
                where = {
                    [Op.and]: [
                        baseWhere,
                        { type: { [Op.notIn]: ['holiday', 'vacation'] } }
                    ]
                };
            }
        }

        const events = await Event.findAll({
            where,
            include: [Category],
            order: [['start', 'ASC']]
        });

        // Generate ICS
        let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Schulkalender//Export//DE\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Schulkalender Export\r\nX-WR-TIMEZONE:Europe/Berlin\r\n";

        const formatDate = (date, isAllDay, isEnd) => {
            if (isAllDay) {
                // ICS Date: YYYYMMDD
                if (isEnd) {
                    // Exclusive end date for all day
                    const d = new Date(date);
                    d.setDate(d.getDate() + 1);
                    return format(d, 'yyyyMMdd');
                }
                return format(date, 'yyyyMMdd');
            }
            // ICS DateTime: YYYYMMDDTHHMMSS
            // We assume local time for simplicity or convert to UTC 'Z'
            // DB stores local dates. 
            return format(date, "yyyyMMdd'T'HHmmss");
        };

        for (const evt of events) {
            ics += "BEGIN:VEVENT\r\n";
            ics += `UID:schulkalender-${evt.id}\r\n`;
            ics += `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}Z\r\n`;

            if (evt.isAllDay) {
                ics += `DTSTART;VALUE=DATE:${formatDate(evt.start, true, false)}\r\n`;
                ics += `DTEND;VALUE=DATE:${formatDate(evt.end, true, true)}\r\n`;
            } else {
                ics += `DTSTART;TZID=Europe/Berlin:${formatDate(evt.start, false, false)}\r\n`;
                ics += `DTEND;TZID=Europe/Berlin:${formatDate(evt.end, false, true)}\r\n`;
            }

            ics += `SUMMARY:${evt.title}\r\n`;
            if (evt.description) ics += `DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}\r\n`; // Escape newlines
            if (evt.location) ics += `LOCATION:${evt.location}\r\n`;

            // Categories
            if (evt.Category) ics += `CATEGORIES:${evt.Category.title}\r\n`;

            ics += "END:VEVENT\r\n";
        }

        ics += "END:VCALENDAR";

        res.header('Content-Type', 'text/calendar; charset=utf-8');
        res.header('Content-Disposition', 'attachment; filename="schulkalender_export.ics"');
        res.send(ics);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating ICS');
    }
});

module.exports = router;
