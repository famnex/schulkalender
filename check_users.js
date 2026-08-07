const { sequelize, User } = require('./server/src/models');

async function check() {
    try {
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN displayName VARCHAR(255);");
            console.log("Database Migration: Added column 'displayName' to Users table");
        } catch (err) {
            console.log("Migration skip/error:", err.message);
        }

        const users = await User.findAll();
        console.log('--- USERS IN DATABASE ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, DisplayName: ${u.displayName}, AuthMethod: ${u.authMethod}`);
        });
        console.log('-------------------------');
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        process.exit(0);
    }
}

check();
