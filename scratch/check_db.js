const { Event, Tag, Category, sequelize } = require('../server/src/models');

async function check() {
    await sequelize.authenticate();
    console.log("Connected.");
    
    // Get tags
    const tags = await Tag.findAll();
    console.log("DB Tags:");
    tags.forEach(t => console.log(` - ID: ${t.id}, name: '${t.name}', title: '${t.title}', categoryId: ${t.categoryId}`));

    // Get events
    const events = await Event.findAll({ limit: 10 });
    console.log("\nEvents (up to 10):");
    events.forEach(e => {
        console.log(` - ID: ${e.id}, Title: '${e.title}', isManual: ${e.isManual}, description: ${JSON.stringify(e.description)}`);
    });
    
    process.exit(0);
}

check().catch(console.error);
