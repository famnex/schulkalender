const { GlobalSettings, sequelize } = require('./server/src/models');

async function checkLogo() {
    try {
        const setting = await GlobalSettings.findOne({ where: { key: 'school_logo' } });
        if (setting) {
            console.log('Current logo path:', setting.value);
            if (setting.value.startsWith('/uploads/') && !setting.value.startsWith('/kalender_new/uploads/')) {
                console.log('Path needs update.');
            } else {
                console.log('Path looks correct or is empty.');
            }
        } else {
            console.log('No school_logo setting found.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkLogo();
