const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function updateDb() {
    try {
        console.log('Adding isManual column to Events table...');
        const queryInterface = sequelize.getQueryInterface();
        
        // Ensure table exists and check columns
        const tableDesc = await queryInterface.describeTable('Events');
        if (!tableDesc.isManual) {
            await queryInterface.addColumn('Events', 'isManual', {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            });
            console.log('Column isManual added successfully!');
        } else {
            console.log('Column isManual already exists. No action taken.');
        }
    } catch (err) {
        console.error('Error updating DB:', err);
    } finally {
        await sequelize.close();
    }
}

updateDb();
