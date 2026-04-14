const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Pfad zur Datenbank
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Starte Datenbank-Upgrade ---');

const columnsToAdd = [
    { table: 'Events', sql: 'ALTER TABLE `Events` ADD COLUMN `isManual` BOOLEAN DEFAULT false;' },
    { table: 'Events', sql: 'ALTER TABLE `Events` ADD COLUMN `status` VARCHAR(50) DEFAULT "published";' },
    { table: 'Events', sql: 'ALTER TABLE `Events` ADD COLUMN `creatorId` INTEGER REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;' }
];

db.serialize(() => {
    columnsToAdd.forEach(col => {
        db.run(col.sql, function(err) {
            if (err) {
                // Ignore "duplicate column name" errors
                if (err.message.includes('duplicate column name')) {
                    console.log(`[OK] Spalte existiert bereits (übersprungen).`);
                } else if (err.message.includes('no such table')) {
                     console.log(`[Hinweis] Tabelle ${col.table} existiert nicht. Wahrscheinlich keine sqlite DB oder falscher Name.`);
                } else {
                    console.error(`[Fehler] beim Ausführen von: ${col.sql}`, err.message);
                }
            } else {
                console.log(`[Erfolg] Spalte in ${col.table} erfolgreich hinzugefügt!`);
            }
        });
    });
});

db.close((err) => {
    if (err) {
         console.error('Fehler beim Schließen der Datenbank:', err.message);
    } else {
         console.log('--- Datenbank-Upgrade abgeschlossen ---');
    }
});
