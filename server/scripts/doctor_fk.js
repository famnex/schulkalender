const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("=== FOREIGN KEY ANALYSE ===");

db.serialize(() => {
    // 1. Check existing FKs
    db.all("PRAGMA foreign_key_list(Events);", (err, fks) => {
        if (err) console.error(err);
        else {
            console.log("Eingetragene Foreign Keys für 'Events':");
            console.table(fks);
        }
    });

    // 2. Was passiert beim echten Insert ohne FK checks?
    // SQLite Pragma
    db.all("PRAGMA foreign_keys;", (err, res) => {
        console.log("Sind Foreign Keys in SQLite global aktiviert?", res);
    });

    // 3. Zeige uns die ersten Kategorien, die existieren
    db.all("SELECT id, title FROM Categories LIMIT 5;", (err, cats) => {
        console.log("\nVerfügbare Kategorie-IDs:");
        console.table(cats);
    });

    // 4. Zeige den Admin-User, der als creatorId genutzt wurde
    db.all("SELECT id, username FROM Users WHERE isAdmin = 1 LIMIT 1;", (err, users) => {
        console.log("\nAdmin User gefunden:");
        console.table(users);
        
        if(users && users.length > 0 && cats && cats.length > 0) {
            console.log(`\n=> Ein echter Termin hätte also type 'default', categoryId: ${cats[0].id}, creatorId: ${users[0].id}`);
        }
    });
});

setTimeout(() => db.close(), 1000);
