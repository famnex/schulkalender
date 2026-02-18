const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GlobalSettings = sequelize.define('GlobalSettings', {
    key: {
        type: DataTypes.STRING, // e.g., "ldap_url", "primary_color"
        primaryKey: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = GlobalSettings;
