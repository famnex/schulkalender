const { Event, Category, User, sequelize } = require('../src/models');
const crypto = require('crypto');

async function runDebug() {
    console.log("=== TIEFEN-ANALYSE & DEBUGGING ===");
    try {
        await sequelize.authenticate();
        console.log("[OK] Datenbank verbunden.\n");

        // 1. Genaue Zählung der Termine
        console.log("--- 1. DATENBANK STATUS ---");
        const total = await Event.count();
        console.log(`Gesamtanzahl Termine: ${total}`);

        const published = await Event.count({ where: { status: 'published' } });
        const pending = await Event.count({ where: { status: 'pending' } });
        const nullStatus = await Event.count({ where: { status: null } });
        
        console.log(`Davon "published" : ${published}`);
        console.log(`Davon "pending"   : ${pending}`);
        console.log(`Davon "null"      : ${nullStatus}`);

        if (pending > 0 || nullStatus > 0) {
            console.log("\n-> Es GIBT also offene Termine in der Datenbank!");
            // Zeige die ersten 3
            const ghostEvents = await Event.findAll({
                where: { status: ['pending', null] },
                limit: 3
            });
            console.log("Beispiele von Pending-Terminen:");
            ghostEvents.forEach(e => console.log(`   ID: ${e.id} | Titel: ${e.title} | isManual: ${e.isManual}`));
            
            // HOTFIX: Wenn es Karteileichen vom Sync sind (isManual=false), reparieren wir sie sofort testweise.
            const autoFixed = await Event.update(
                { status: 'published' },
                { where: { isManual: false, status: ['pending', null] } }
            );
            console.log(`[HOTFIX] Habe ${autoFixed[0]} alte gesyncte Termine zwangsweise auf 'published' gesetzt.`);
        } else {
             console.log("\n-> Die Datenbank meldet 0 'pending' Termine. Wenn dein Browser 485 anzeigt, ist das ein Browser-Cache-Problem aus der Vergangenheit. Bitte drücke STRG+F5 in deinem Browser oder lösche den Browser-Cache.");
        }


        // 2. Fehler beim Anlegen simulieren
        console.log("\n--- 2. TERMIN ANLEGEN DEBUGGEN ---");
        console.log("Versuche jetzt, exakt wie das API-Skript, einen Termin anzulegen...");
        
        // Suche zuerst einen Admin-Benutzer
        const adminUser = await User.findOne({ where: { isAdmin: true } });
        if (!adminUser) {
            console.log("[FEHLER] Kein Admin-Benutzer in der Datenbank gefunden!");
            process.exit(1);
        }

        const customId = 'DEBUG_' + crypto.randomBytes(8).toString('hex');
        
        try {
            const newEvent = await Event.create({
                id: customId,
                title: 'DEBUG TERMIN',
                start: new Date(),
                end: new Date(Date.now() + 3600000), // +1 hour
                isAllDay: false,
                location: 'Debug Testraum',
                description: 'Test',
                categoryId: 1, // Fallback Category
                type: 'default',
                isManual: true,
                status: 'published',
                creatorId: adminUser.id
            });
            console.log(`[ERFOLG] Termin erfolgreich in DB gespeichert (ID: ${newEvent.id})`);
            
            // Clean up test event
            await Event.destroy({ where: { id: customId } });
            console.log("[INFO] Debug-Termin wieder restlos entfernt.");
            
        } catch (createErr) {
            console.error("\n[ABSTURZ-URSACHE GEFUNDEN!] Beim Anlegen eines Termins passiert tief in der Datenbank folgender Fehler:");
            console.error("->", createErr.name);
            console.error("->", createErr.message);
            if (createErr.errors) {
                 createErr.errors.forEach(e => console.error("   Detail:", e.message));
            }
        }

    } catch (err) {
        console.error("Allgemeiner Fehler:", err);
    } finally {
        process.exit(0);
    }
}

runDebug();
