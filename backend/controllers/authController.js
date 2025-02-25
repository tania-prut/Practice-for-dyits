// backend/controllers/authController.js
const User = require('../models/User');
const Collection = require('../models/Collection'); // Імпортуємо модель колекції
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const user = await User.create({ name, email, password });

        await Collection.bulkCreate([
            { name: 'Читаю', coverUrl: `${API_BASE_URL}/assets/read.png`, userId: user.id },
            { name: 'Прочитано', coverUrl: `${API_BASE_URL}/assets/done.png`, userId: user.id },
            { name: 'В планах', coverUrl: `${API_BASE_URL}/assets/order.png`, userId: user.id },
        ]);

        const userData = user.toJSON();
        delete userData.password;

        res.status(201).json(userData);
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const messages = err.errors.map((error) => error.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};
