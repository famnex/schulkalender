const { Event, Category, User, sequelize } = require('../src/models');
const crypto = require('crypto');

async function testInsert() {
    console.log("=== FINALER INSERT-TEST ===");
    try {
        await sequelize.authenticate();

        // 1. Hole eine echte Kategorie
        const category = await Category.findOne();
        if (!category) {
            console.log("[FEHLER] Keine einzige Kategorie in der Datenbank gefunden!");
            process.exit(1);
        }
        console.log(`[OK] Nutze eine echte Kategorie: ${category.id} - ${category.title}`);

        // 2. Hole echten Admin User
        const adminUser = await User.findOne({ where: { isAdmin: true } });
        if (!adminUser) {
            console.log("[FEHLER] Kein Admin gefunden.");
            process.exit(1);
        }
        console.log(`[OK] Nutze echten Admin User: ${adminUser.id} - ${adminUser.username}`);

        // 3. Simuliere einen sauberen Insert wie das Frontend es eigentlich tun sollte
        const customId = 'MANUAL_' + crypto.randomBytes(8).toString('hex');

        console.log("\n-> Versuche Event in die Datenbank zu schreiben...");
        const newEvent = await Event.create({
            id: customId,
            title: 'Real World SQLite Test',
            start: new Date(),
            end: new Date(Date.now() + 3600),
            isAllDay: false,
            location: 'UI Test',
            description: 'Ohne Fake-Kategorie',
            categoryId: category.id,  // Nimm exakt diese Kategorie ID!
            type: 'default',
            isManual: true,
            status: 'published',
            creatorId: adminUser.id   // Nimm exakt den Admin!
        });

        console.log(`\n[ERFOLG] 🥳 Der Insert der Datenbank funktioniert einwandfrei!`);
        console.log(`Das bedeutet: Wenn das Anlegen in der Weboberfläche immer noch fehlschlägt, sendet die Weboberfläche falsche Daten (z.B. keine Kategorie ausgewählt).`);

        // Aufräumen
        await Event.destroy({ where: { id: customId } });
        console.log("[OK] Testdaten wieder gelöscht.");

    } catch (err) {
        console.error("\n[FEHLER]", err.name, err.message);
    } finally {
        process.exit(0);
    }
}
testInsert();
