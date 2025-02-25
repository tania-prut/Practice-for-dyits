// backend/models/UserProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const UserProfile = sequelize.define('UserProfile', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    nickname: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    avatarUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    signature: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    about: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
});

module.exports = UserProfile;
