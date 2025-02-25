// backend/controllers/chatController.js
const { RealMessage, UserProfile } = require('../models');

const initChat = (io) => {
    io.on('connection', (socket) => {
        console.log('Новий користувач підключився: ' + socket.id);

        socket.on('getMessages', async () => {
            try {
                const messages = await RealMessage.findAll({
                    where: { deleted: false },
                    order: [['createdAt', 'ASC']],
                    limit: 200
                });
                socket.emit('messagesHistory', messages);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('newMessage', async (data) => {
            try {
                let nickname = data.nickname;
                if (!nickname) {
                    const profile = await UserProfile.findOne({ where: { userId: data.userId } });
                    nickname = profile ? profile.nickname : 'Невідомий';
                }
                const newMsg = await RealMessage.create({
                    userId: data.userId,
                    nickname: nickname,
                    message: data.message
                });
                const count = await RealMessage.count();
                if (count > 200) {
                    const oldest = await RealMessage.findOne({ order: [['createdAt', 'ASC']] });
                    if (oldest) {
                        await oldest.destroy();
                    }
                }
                io.emit('messageAdded', {
                    id: newMsg.id,
                    userId: newMsg.userId,
                    nickname: newMsg.nickname,
                    message: newMsg.message,
                    createdAt: newMsg.createdAt,
                    deleted: newMsg.deleted,
                    edited: newMsg.edited
                });
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('editMessage', async (data) => {
            try {
                const msg = await RealMessage.findByPk(data.id);
                if (msg && msg.userId === data.userId) {
                    msg.message = data.newMessage;
                    msg.edited = true;
                    await msg.save();
                    io.emit('messageUpdated', {
                        id: msg.id,
                        newMessage: msg.message,
                        edited: msg.edited
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('deleteMessage', async (data) => {
            try {
                const msg = await RealMessage.findByPk(data.id);
                if (msg && msg.userId === data.userId) {
                    await msg.destroy();
                    io.emit('messageDeleted', { id: data.id });
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
};

module.exports = { initChat };
