const { sequelize, User, GlobalSettings } = require('../src/models');

async function checkDB() {
    try {
        console.log('Authenticating with database...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        console.log('Checking Users table...');
        const userCount = await User.count();
        console.log(`User count: ${userCount}`);

        const users = await User.findAll({ attributes: ['username', 'authMethod'] });
        console.log('Users:', JSON.stringify(users, null, 2));

        console.log('Checking GlobalSettings table...');
        const settingsCount = await GlobalSettings.count();
        console.log(`GlobalSettings count: ${settingsCount}`);

        const settings = await GlobalSettings.findAll();
        console.log('GlobalSettings:', JSON.stringify(settings, null, 2));

    } catch (err) {
        console.error('Database Check Failed:', err);
    } finally {
        await sequelize.close();
    }
}

checkDB();
