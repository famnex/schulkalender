const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Running migration: add status and creatorId to Events tabelle');

db.serialize(() => {
    // 1. Add status
    db.run("ALTER TABLE Events ADD COLUMN status VARCHAR(20) DEFAULT 'published'", (err) => {
        if (err && err.message.includes("duplicate column name")) {
            console.log("- status column already exists.");
        } else if (err) {
            console.error("Error adding status column:", err.message);
        } else {
            console.log("- Successfully added 'status' column.");
        }
        
        // 2. Add creatorId
        db.run("ALTER TABLE Events ADD COLUMN creatorId INTEGER", (err2) => {
            if (err2 && err2.message.includes("duplicate column name")) {
                console.log("- creatorId column already exists.");
            } else if (err2) {
                console.error("Error adding creatorId column:", err2.message);
            } else {
                console.log("- Successfully added 'creatorId' column.");
            }
            
            console.log("Migration complete.");
            db.close();
            process.exit(0);
        });
    });
});
