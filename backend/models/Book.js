// backend/models/Book.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    publisher: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isPrinted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: DataTypes.ENUM('цикл', 'одиночна'),
        allowNull: false,
        defaultValue: 'одиночна',
    },
    coverUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Book;
