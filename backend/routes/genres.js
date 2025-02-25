// backend/routes/genres.js
const express = require('express');
const router = express.Router();
const genresController = require('../controllers/genresController');

router.get('/', genresController.getAllGenres);

module.exports = router;
