const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.STRING, // e.g., "ABW:10B"
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, // e.g., "10B"
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Tag;
