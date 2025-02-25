// backend/models/Collection.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    coverUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: false, // якщо потрібні createdAt і updatedAt; ви згадали, що дата створення не потрібна – можна вимкнути
    updatedAt: false,
});

module.exports = Collection;
