const { SavedFilter } = require('./server/src/models');

async function run() {
    try {
        const token = '33cd50eca8';
        console.log(`Searching for token: ${token}`);
        const filter = await SavedFilter.findByPk(token);
        if (!filter) {
            console.log('Token not found in DB.');
        } else {
            console.log('Found Filter:');
            console.log('Name:', filter.name);
            console.log('Config:', JSON.stringify(filter.config, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
