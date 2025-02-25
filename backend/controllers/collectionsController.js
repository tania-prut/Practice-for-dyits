// backend/controllers/collectionsController.js

const { Collection, Book } = require('../models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

function normalizeBookCover(bookObj) {
    if (bookObj.coverUrl) {
        try {
            const urlObj = new URL(bookObj.coverUrl);
            bookObj.coverUrl = `${API_BASE_URL}${urlObj.pathname}`;
        } catch (error) {
            if (bookObj.coverUrl.startsWith('/')) {
                bookObj.coverUrl = `${API_BASE_URL}${bookObj.coverUrl}`;
            }
        }
    }
    return bookObj;
}

exports.getRecentBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const collections = await Collection.findAll({
            where: { userId },
            include: [{
                model: Book,
                through: { attributes: ['createdAt'] }
            }]
        });
        let allBooks = [];
        collections.forEach(collection => {
            if (collection.Books) {
                collection.Books.forEach(book => {
                    let bookObj = {
                        ...book.toJSON(),
                        collectionName: collection.name,
                        createdAt: book.CollectionBooks.createdAt
                    };
                    bookObj = normalizeBookCover(bookObj);
                    allBooks.push(bookObj);
                });
            }
        });
        allBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const recentBooks = allBooks.slice(0, 15);
        res.json(recentBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка отримання останніх книг' });
    }
};

exports.getUserCollections = async (req, res) => {
    try {
        const userId = req.user.id;
        let collections = await Collection.findAll({
            where: { userId },
            include: [{
                model: Book,
                through: { attributes: [] }
            }]
        });
        collections = collections.map(col => {
            if (col.coverUrl) {
                try {
                    const urlObj = new URL(col.coverUrl);
                    col.coverUrl = `${API_BASE_URL}${urlObj.pathname}`;
                } catch (error) {
                    if (!col.coverUrl.startsWith('/')) {
                        col.coverUrl = `${API_BASE_URL}/${col.coverUrl}`;
                    } else {
                        col.coverUrl = `${API_BASE_URL}${col.coverUrl}`;
                    }
                }
            }
            return col;
        });
        res.json(collections);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка отримання колекцій' });
    }
};


exports.getCollectionById = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const collection = await Collection.findByPk(collectionId, {
            include: [{
                model: Book,
                through: { attributes: ['createdAt'] }  // повертаємо createdAt для сортування
            }]
        });
        if (!collection) {
            return res.status(404).json({ message: 'Колекцію не знайдено' });
        }
        const result = collection.toJSON();

        if (result.coverUrl && !result.coverUrl.startsWith('http')) {
            result.coverUrl = API_BASE_URL + result.coverUrl;
        }

        if (result.Books && Array.isArray(result.Books)) {
            result.Books.sort((a, b) => new Date(b.CollectionBooks.createdAt) - new Date(a.CollectionBooks.createdAt));
            result.Books = result.Books.map(book => normalizeBookCover(book));
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка отримання деталей колекції' });
    }
};


exports.createCollection = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, coverUrl } = req.body;
        const newCollection = await Collection.create({ name, coverUrl, userId });
        res.status(201).json(newCollection);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка створення колекції' });
    }
};


exports.updateCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { name, coverUrl } = req.body;
        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Колекцію не знайдено' });
        }
        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ заборонено' });
        }
        await collection.update({ name, coverUrl });
        res.json(collection);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка оновлення колекції' });
    }
};


exports.deleteCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Колекцію не знайдено' });
        }
        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ заборонено' });
        }
        await collection.destroy();
        res.json({ message: 'Колекцію видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка видалення колекції' });
    }
};


exports.addBooksToCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { bookIds } = req.body;
        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Колекцію не знайдено' });
        }
        await collection.addBooks(bookIds);
        const updatedCollection = await Collection.findByPk(collectionId, {
            include: [{
                model: Book,
                through: { attributes: ['createdAt'] }
            }]
        });
        const result = updatedCollection.toJSON();

        if (result.Books && Array.isArray(result.Books)) {
            result.Books.sort((a, b) => new Date(b.CollectionBooks.createdAt) - new Date(a.CollectionBooks.createdAt));
            result.Books = result.Books.map(book => normalizeBookCover(book));
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка додавання книг до колекції' });
    }
};

const coversDirCollections = 'uploads/collectionCovers';
if (!fs.existsSync(coversDirCollections)) {
    fs.mkdirSync(coversDirCollections, { recursive: true });
}

const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, coversDirCollections);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'collectionCover_' + Date.now() + ext);
    }
});
const coverUpload = multer({ storage: coverStorage });


exports.uploadCover = coverUpload.single('cover');

exports.handleUploadCover = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не завантажено' });
    }
    const fileName = req.file.filename;
    const coverUrl = `${API_BASE_URL}/uploads/collectionCovers/${fileName}`;
    res.json({ coverUrl });
};

exports.removeBookFromCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const bookId = req.params.bookId;
        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Колекцію не знайдено' });
        }
        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'Доступ заборонено' });
        }
        await collection.removeBook(bookId);
        const updatedCollection = await Collection.findByPk(collectionId, {
            include: [{
                model: Book,
                through: { attributes: [] }
            }]
        });
        res.json(updatedCollection);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка видалення книги з колекції' });
    }
};
