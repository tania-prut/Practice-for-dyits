// backend/controllers/profileController.js
const { User, UserProfile } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const HOST = process.env.API_HOST || 'http://localhost:5000';

const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'avatar_' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });

exports.uploadAvatar = upload.single('avatar');

exports.handleUploadAvatar = async (req, res) => {
    const userId = req.user.id;
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не завантажено' });
    }

    const fileName = req.file.filename;
    const avatarUrl = `${HOST}/uploads/avatars/${fileName}`;

    let userProfile = await UserProfile.findOne({ where: { userId } });
    if (!userProfile) {
        userProfile = await UserProfile.create({ userId, avatarUrl });
    } else {
        userProfile.avatarUrl = avatarUrl;
        await userProfile.save();
    }
    res.json({ avatarUrl });
};

exports.getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId, { include: [UserProfile] });
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        const profileData = {
            id: user.id,
            name: user.name,
            email: user.email,
            nickname: user.UserProfile ? user.UserProfile.nickname : '',
            avatarUrl: user.UserProfile && user.UserProfile.avatarUrl ? user.UserProfile.avatarUrl : '',
            signature: user.UserProfile ? user.UserProfile.signature : '',
            about: user.UserProfile ? user.UserProfile.about : '',
        };
        res.json(profileData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, nickname, signature, about, avatarUrl } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        user.name = name;
        await user.save();

        let userProfile = await UserProfile.findOne({ where: { userId } });
        if (!userProfile) {
            userProfile = await UserProfile.create({ userId, nickname, signature, about, avatarUrl });
        } else {
            userProfile.nickname = nickname;
            userProfile.signature = signature;
            userProfile.about = about;
            if (avatarUrl) {
                userProfile.avatarUrl = avatarUrl;
            }
            await userProfile.save();
        }
        res.json({ message: 'Профіль оновлено успішно!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
};
