// backend/models/RealMessage.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const RealMessage = sequelize.define('RealMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Невідомий',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
});

module.exports = RealMessage;
