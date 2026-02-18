const { Event, Category, Op } = require('./server/src/models');
const { format } = require('date-fns');

async function run() {
    try {
        console.log('Searching for "Zeugnisausgabe" around 2026-06-26...');
        const events = await Event.findAll({
            where: {
                title: { [Op.like]: '%Zeugnisausgabe%' }
            },
            include: [Category]
        });

        if (events.length === 0) {
            console.log('No events found with that title.');
        } else {
            events.forEach(e => {
                console.log('--- Event Found ---');
                console.log('ID:', e.id);
                console.log('Title:', e.title);
                console.log('Date:', format(new Date(e.start), 'yyyy-MM-dd'));
                console.log('Category:', e.Category ? e.Category.title : 'None', `(ID: ${e.categoryId})`);
                console.log('Description:', e.description);
                console.log('-------------------');
            });
        }
    } catch (e) {
        console.error(e);
    }
}
run();
