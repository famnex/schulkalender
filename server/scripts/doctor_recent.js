const { Event, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("=== Kürzlich erstellte Termine überprüfen ===");
        
        // Hole alle Termine, die in den letzten 2 Stunden erstellt wurden
        const recent = await Event.findAll({
            where: {
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000)
                }
            },
            order: [['createdAt', 'DESC']]
        });
        
        console.log(`Es wurden ${recent.length} Termine in den letzten 2 Stunden in der Datenbank gespeichert.`);
        
        if (recent.length > 0) {
            recent.forEach(r => {
                console.log(`- ID: ${r.id} | Titel: "${r.title}" | Status: ${r.status} | Datum: ${r.createdAt}`);
            });
        }
        
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
test();
