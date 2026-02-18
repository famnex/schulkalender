const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.STRING, // UID from ICS
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start: {
        type: DataTypes.DATE, // Stored as datetime
        allowNull: false
    },
    end: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isAllDay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    type: { // "default", "holiday", "vacation"
        type: DataTypes.STRING,
        defaultValue: 'default'
    }
});

module.exports = Event;
