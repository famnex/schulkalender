const { Event, Category, sequelize } = require('../src/models');

async function run() {
    console.log("--- SCHULKALENDER DOCTOR ---");
    try {
        await sequelize.authenticate();
        console.log("[OK] Datenbankverbindung erfolgreich.");

        // Check Event structure
        const eventsCount = await Event.count();
        console.log(`[INFO] Gesamtanzahl Termine in DB: ${eventsCount}`);

        const firstEvent = await Event.findOne();
        if (firstEvent) {
             console.log(`[INFO] Beispiel-Termin Status: "${firstEvent.status}"`);
        }

        // Check Pending Events
        const pendingEvents = await Event.findAll({
            where: { status: 'pending' },
            include: [{ model: Category, attributes: ['title'] }]
        });
        
        console.log(`[INFO] Termine mit status='pending': ${pendingEvents.length}`);
        if(pendingEvents.length > 0) {
            console.log(`[INFO] Erstes pending Event: ${pendingEvents[0].title} (isManual: ${pendingEvents[0].isManual})`);
        }

        // Simuliere den API Call Ablauf genau wie Express es tut
        console.log("\n--- SIMULATION API RESPONSE ---");
        const jsonResponse = JSON.stringify(pendingEvents);
        console.log(`[Type of Response]: ${typeof pendingEvents}`);
        console.log(`[Is Array?]: ${Array.isArray(pendingEvents)}`);
        
    } catch (err) {
        console.error("[FEHLER]", err.message);
    } finally {
        process.exit(0);
    }
}

run();
