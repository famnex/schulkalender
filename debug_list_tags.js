const { Tag } = require('./server/src/models');

async function run() {
    try {
        const tags = await Tag.findAll();
        console.log('--- Tag Definitions ---');
        tags.forEach(t => {
            console.log(`ID: ${t.id}, Name: ${t.name}, CategoryID: ${t.categoryId}`);
        });
    } catch (e) {
        console.error(e);
    }
}
run();
