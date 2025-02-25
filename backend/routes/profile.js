// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/profile', authMiddleware, profileController.getProfile);

router.put('/profile', authMiddleware, profileController.updateProfile);

router.post('/upload-avatar', authMiddleware, profileController.uploadAvatar, profileController.handleUploadAvatar);

module.exports = router;
