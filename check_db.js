const { Event } = require('./server/src/models');
const { Op } = require('sequelize');

async function checkEvents() {
    try {
        const holidays = await Event.findAll({
            where: {
                type: 'holiday'
            },
            limit: 5
        });
        console.log('Holidays:', JSON.stringify(holidays, null, 2));

        const vacations = await Event.findAll({
            where: {
                type: 'vacation'
            },
            limit: 5
        });
        console.log('Vacations:', JSON.stringify(vacations, null, 2));

        const allTypes = await Event.findAll({
            attributes: ['type'],
            group: ['type']
        });
        console.log('Available types:', allTypes.map(t => t.type));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkEvents();
