const { sequelize } = require('../src/models');
const { syncAllCalendars } = require('../src/services/icsSync');

async function runSync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected. Starting Sync...');

        await syncAllCalendars();

        console.log('Sync Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Sync Failed:', err);
        process.exit(1);
    }
}

runSync();
