const { Event, Tag, sequelize } = require('../server/src/models');

async function check() {
    const events = await Event.findAll({ where: { isManual: true } });
    console.log("Manual Events:", events.length);
    events.forEach(e => {
        console.log(` - ID: ${e.id}, Title: '${e.title}', description: ${JSON.stringify(e.description)}`);
    });
    process.exit(0);
}

check().catch(console.error);
