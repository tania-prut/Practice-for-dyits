// backend/models/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('book_club_base', 'postgres', 'DoesMe333111!', {
    host: 'localhost',
    dialect: 'postgres',
});

sequelize
    .authenticate()
    .then(() => console.log('Connection to PostgreSQL has been established successfully.'))
    .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
