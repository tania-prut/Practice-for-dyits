// backend/models/index.js
const sequelize = require('./db');
const User = require('./User');
const UserProfile = require('./UserProfile');
const Genre = require('./Genre');
const Book = require('./Book');
const Collection = require('./Collection');
const RealMessage = require('./RealMessage'); // Додаємо RealMessage

// Асоціації, які вже є...
// User 1:1 UserProfile
User.hasOne(UserProfile, { foreignKey: 'userId' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

// User many-to-many Genre
User.belongsToMany(Genre, { through: 'UserGenres' });
Genre.belongsToMany(User, { through: 'UserGenres' });

// Book many-to-many Genre
Book.belongsToMany(Genre, { through: 'BookGenres' });
Genre.belongsToMany(Book, { through: 'BookGenres' });

User.belongsToMany(Book, { through: 'UserBooks' });
Book.belongsToMany(User, { through: 'UserBooks' });

User.hasMany(Collection, { foreignKey: 'userId' });
Collection.belongsTo(User, { foreignKey: 'userId' });

Collection.belongsToMany(Book, { through: 'CollectionBooks' });
Book.belongsToMany(Collection, { through: 'CollectionBooks' });

const initDb = async () => {
    try {
        await sequelize.sync();
        console.log('All models were synchronized successfully.');
    } catch (err) {
        console.error('Error synchronizing models:', err);
    }
};

initDb();

module.exports = {
    sequelize,
    User,
    UserProfile,
    Genre,
    Book,
    Collection,
    RealMessage,
};
