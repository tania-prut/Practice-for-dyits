// backend/routes/books.js
const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', booksController.getAllBooks);

router.post('/', authMiddleware, booksController.createBook);

router.post('/upload-cover', authMiddleware, booksController.uploadCover, booksController.handleUploadCover);

router.put('/:id', authMiddleware, booksController.updateBook);

router.delete('/:id', authMiddleware, booksController.deleteBook);

module.exports = router;
