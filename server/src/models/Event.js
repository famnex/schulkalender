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
    },
    isManual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'published' // 'pending' | 'published'
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Event;
