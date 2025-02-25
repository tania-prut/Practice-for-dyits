// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const booksRoutes = require('./routes/books');
const genresRoutes = require('./routes/genres');
const collectionsRoutes = require('./routes/collections');

app.use('/api/collections', collectionsRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);

app.get('/', (req, res) => {
    res.send('Hello from Book Club backend!');
});

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: { origin: '*' }
});

const { initChat } = require('./controllers/chatController');
initChat(io);

const { sequelize } = require('./models');
const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
    console.log('All models were synchronized successfully.');
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error synchronizing models:', err);
});
