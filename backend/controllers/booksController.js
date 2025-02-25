// backend/controllers/booksController.js
const { Book, Genre } = require('../models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const HOST = process.env.API_HOST || 'http://localhost:5000';

const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
}

function normalizeCoverUrlForDB(url) {
    if (url && url.startsWith(HOST)) {
        return url.replace(HOST, '');
    }
    return url;
}

function normalizeBookCover(book) {
    const plainBook = book.toJSON();
    if (plainBook.coverUrl) {
        if (plainBook.coverUrl.startsWith('/')) {
            plainBook.coverUrl = `${HOST}${plainBook.coverUrl}`;
        } else {
            try {
                const urlObj = new URL(plainBook.coverUrl);
                plainBook.coverUrl = `${HOST}${urlObj.pathname}`;
            } catch (error) {
            }
        }
    }
    return plainBook;
}

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            include: [{
                model: Genre,
                through: { attributes: [] }
            }]
        });
        const normalizedBooks = books.map(normalizeBookCover);
        res.json(normalizedBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка отримання книг" });
    }
};

exports.createBook = async (req, res) => {
    try {
        let { title, author, year, publisher, pages, isPrinted, type, genres, coverUrl } = req.body;
        coverUrl = normalizeCoverUrlForDB(coverUrl);
        const newBook = await Book.create({ title, author, year, publisher, pages, isPrinted, type, coverUrl });

        if (genres && Array.isArray(genres)) {
            await newBook.setGenres(genres);
        }

        const createdBook = await Book.findByPk(newBook.id, {
            include: [{ model: Genre, through: { attributes: [] } }]
        });

        res.status(201).json(normalizeBookCover(createdBook));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка створення книги" });
    }
};

const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, coversDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'cover_' + Date.now() + ext);
    }
});

const coverUpload = multer({ storage: coverStorage });
exports.uploadCover = coverUpload.single('cover');

exports.handleUploadCover = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не завантажено' });
    }

    const fileName = req.file.filename;
    const coverUrl = `/uploads/covers/${fileName}`;
    res.json({ coverUrl });
};

exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        let { title, author, year, publisher, pages, isPrinted, type, genres, coverUrl } = req.body;
        coverUrl = normalizeCoverUrlForDB(coverUrl);

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Книга не знайдена' });
        }

        await book.update({ title, author, year, publisher, pages, isPrinted, type, coverUrl });

        if (genres && Array.isArray(genres)) {
            await book.setGenres(genres);
        }

        const updatedBook = await Book.findByPk(bookId, {
            include: [{ model: Genre, through: { attributes: [] } }]
        });

        res.json(normalizeBookCover(updatedBook));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка оновлення книги" });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Книга не знайдена' });
        }
        await book.destroy();
        res.json({ message: 'Книгу видалено успішно' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка видалення книги' });
    }
};
