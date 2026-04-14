const { Event } = require('../src/models');

(async () => {
    try {
        const customId = 'MANUAL_TEST' + Math.random();
        const newEvent = await Event.create({
            id: customId,
            title: 'Test',
            start: new Date(),
            end: new Date(),
            isAllDay: false,
            location: '',
            description: '',
            categoryId: "5",
            type: 'default',
            isManual: true,
            status: 'published',
            creatorId: 1
        });
        console.log("Success", newEvent.toJSON());
    } catch(e) {
        console.error("Error creating event:", e);
    }
    process.exit(0);
})();
