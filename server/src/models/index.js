const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Tag = require('./Tag');
const Event = require('./Event');
const SavedFilter = require('./SavedFilter');
const GlobalSettings = require('./GlobalSettings');

// Associations
User.hasMany(SavedFilter, { foreignKey: 'userId' });
SavedFilter.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Tag, { foreignKey: 'categoryId' });
Tag.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Event, { foreignKey: 'categoryId' });
Event.belongsTo(Category, { foreignKey: 'categoryId' });

const { Op } = require('sequelize');

module.exports = {
    sequelize,
    Op,
    User,
    Category,
    Tag,
    Event,
    SavedFilter,
    GlobalSettings
};
