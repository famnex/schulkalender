const fs = require('fs');
const path = require('path');
const { sequelize, User, Category, Tag, Event, SavedFilter, GlobalSettings } = require('../models');

async function importDatabase() {
    try {
        await sequelize.authenticate();
        console.log('--- Datenbank Import startet ---');

        const inputPath = path.join(__dirname, '../../../db_snapshot.json');
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Snapshot-Datei nicht gefunden unter: ${inputPath}`);
        }

        const snapshot = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

        // Transaktion starten, um Datenkonsistenz zu wahren
        await sequelize.transaction(async (t) => {
            // 1. Bestehende Daten löschen (Reihenfolge wichtig wegen Foreign Keys!)
            console.log('Lösche alte Daten...');
            await SavedFilter.destroy({ where: {}, transaction: t });
            await Event.destroy({ where: {}, transaction: t });
            await Tag.destroy({ where: {}, transaction: t });
            await Category.destroy({ where: {}, transaction: t });
            await User.destroy({ where: {}, transaction: t });
            await GlobalSettings.destroy({ where: {}, transaction: t });

            // 2. Neue Daten einfügen
            console.log('Füge Snapshot-Daten ein...');

            if (snapshot.GlobalSettings.length) await GlobalSettings.bulkCreate(snapshot.GlobalSettings, { transaction: t });
            if (snapshot.Users.length) await User.bulkCreate(snapshot.Users, { transaction: t });
            if (snapshot.Categories.length) await Category.bulkCreate(snapshot.Categories, { transaction: t });
            if (snapshot.Tags.length) await Tag.bulkCreate(snapshot.Tags, { transaction: t });
            if (snapshot.Events.length) await Event.bulkCreate(snapshot.Events, { transaction: t });
            if (snapshot.SavedFilters.length) await SavedFilter.bulkCreate(snapshot.SavedFilters, { transaction: t });
        });

        console.log('Erfolg! Datenbank wurde aus dem Snapshot wiederhergestellt.');

    } catch (error) {
        console.error('Import fehlgeschlagen:', error);
    } finally {
        await sequelize.close();
    }
}

importDatabase();
