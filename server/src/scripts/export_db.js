const fs = require('fs');
const path = require('path');
const { sequelize, User, Category, Tag, Event, SavedFilter, GlobalSettings } = require('../models');

async function exportDatabase() {
    try {
        await sequelize.authenticate();
        console.log('--- Datenbank Export startet ---');

        const snapshot = {
            GlobalSettings: await GlobalSettings.findAll({ raw: true }),
            Categories: await Category.findAll({ raw: true }),
            Tags: await Tag.findAll({ raw: true }),
            Users: await User.findAll({ raw: true }),
            SavedFilters: await SavedFilter.findAll({ raw: true }),
            Events: await Event.findAll({ raw: true })
        };

        const outputPath = path.join(__dirname, '../../../db_snapshot.json');
        fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

        console.log(`Erfolg! Snapshot wurde erstellt unter: ${outputPath}`);
        console.log(`Zusammenfassung:`);
        Object.keys(snapshot).forEach(key => {
            console.log(`- ${key}: ${snapshot[key].length} Einträge`);
        });

    } catch (error) {
        console.error('Export fehlgeschlagen:', error);
    } finally {
        await sequelize.close();
    }
}

exportDatabase();
