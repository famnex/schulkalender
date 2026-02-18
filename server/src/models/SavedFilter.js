const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedFilter = sequelize.define('SavedFilter', {
    id: {
        type: DataTypes.STRING(10), // 10-char random code
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    config: {
        type: DataTypes.JSON, // Contains selected categories and tags
        allowNull: false
    }
});

module.exports = SavedFilter;
