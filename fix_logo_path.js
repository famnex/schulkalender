
const { GlobalSettings, sequelize } = require('./server/src/models');

async function fixLogo() {
    try {
        const setting = await GlobalSettings.findOne({ where: { key: 'school_logo' } });
        if (setting && setting.value.startsWith('/uploads/')) {
            const oldValue = setting.value;
            const newValue = '/kalender_new' + oldValue;
            console.log(`Updating logo path from ${oldValue} to ${newValue}`);

            await GlobalSettings.update(
                { value: newValue },
                { where: { key: 'school_logo' } }
            );
            console.log('Update successful.');
        } else {
            console.log('Logo path is already correct or not set.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

fixLogo();
