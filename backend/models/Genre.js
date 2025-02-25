// backend/models/Genre.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Genre = sequelize.define('Genre', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
});

module.exports = Genre;
