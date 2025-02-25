// backend/routes/collections.js
const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/recentBooks', authMiddleware, collectionsController.getRecentBooks);

router.get('/', authMiddleware, collectionsController.getUserCollections);
router.get('/:id', authMiddleware, collectionsController.getCollectionById);
router.post('/', authMiddleware, collectionsController.createCollection);
router.put('/:id', authMiddleware, collectionsController.updateCollection);
router.delete('/:id', authMiddleware, collectionsController.deleteCollection);
router.post('/:id/books', authMiddleware, collectionsController.addBooksToCollection);

router.post('/upload-cover', authMiddleware, collectionsController.uploadCover, collectionsController.handleUploadCover);

router.delete('/:id/books/:bookId', authMiddleware, collectionsController.removeBookFromCollection);

module.exports = router;
