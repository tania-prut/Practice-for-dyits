import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/Chat.css';

const API_BASE_URL = `http://${window.location.hostname}:5000`;
const socket = io(API_BASE_URL);

const Chat = ({ currentUser }) => {
    const { theme } = useContext(ThemeContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editInput, setEditInput] = useState('');
    const [menuMsgId, setMenuMsgId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.emit('getMessages');
        socket.on('messagesHistory', (msgs) => {
            setMessages(msgs);
        });
        socket.on('messageAdded', (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        socket.on('messageUpdated', (data) => {
            setMessages(prev =>
                prev.map(m => m.id === data.id ? { ...m, message: data.newMessage, edited: data.edited } : m)
            );
        });
        socket.on('messageDeleted', (data) => {
            setMessages(prev => prev.filter(m => m.id !== data.id));
        });
        return () => {
            socket.off('messagesHistory');
            socket.off('messageAdded');
            socket.off('messageUpdated');
            socket.off('messageDeleted');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            socket.emit('newMessage', {
                userId: currentUser.id,
                nickname: currentUser.nickname,
                message: input.trim()
            });
            setInput('');
        }
    };

    const handleEmojiSelect = (emojiData) => {
        setInput(prev => prev + emojiData.emoji);
    };

    const handleEdit = (msg) => {
        setEditingId(msg.id);
        setEditInput(msg.message);
        setMenuMsgId(null);
    };

    const submitEdit = () => {
        if (editInput.trim()) {
            socket.emit('editMessage', { id: editingId, userId: currentUser.id, newMessage: editInput.trim() });
            setEditingId(null);
            setEditInput('');
        }
    };

    const handleDelete = (msgId) => {
        socket.emit('deleteMessage', { id: msgId, userId: currentUser.id });
        setMenuMsgId(null);
    };

    const toggleMenu = (msgId) => {
        setMenuMsgId(menuMsgId === msgId ? null : msgId);
    };

    return (
        <div className="chat-container" style={{
            backgroundColor: theme === 'dark' ? '#333' : 'var(--chat-bg-color)',
        }}>
            <div className="chat-messages">
                {messages.map(msg => {
                    const isOwn = msg.userId === currentUser.id;
                    const isEditing = editingId === msg.id;
                    return (
                        <div
                            key={msg.id}
                            className={`chat-message ${isOwn ? 'own' : ''}`}
                        >
                            <div className="message-header">
                                <div>
                                    {msg.nickname}{' '}
                                    <span className="message-time">
                    {new Date(msg.createdAt).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                                </div>
                                {isOwn && (
                                    <div
                                        className="message-options-trigger"
                                        onClick={() => toggleMenu(msg.id)}
                                    >
                                        •••
                                    </div>
                                )}
                                {menuMsgId === msg.id && (
                                    <div className="message-options-menu">
                                        <button onClick={() => handleEdit(msg)}>Редагувати</button>
                                        <button onClick={() => handleDelete(msg.id)}>Видалити</button>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editInput}
                                        onChange={(e) => setEditInput(e.target.value)}
                                    />
                                    <div className="inline-edit-buttons">
                                        <button className="edit-button" onClick={submitEdit}>Зберегти</button>
                                        <button className="edit-button" onClick={() => setEditingId(null)}>Скасувати</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="message-text">
                                    {msg.message}
                                    {msg.edited && <small style={{ marginLeft: '6px', fontSize: '0.8em', color: '#999' }}>(ред.)</small>}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Блок введення повідомлення */}
            <div className="chat-input-block">
                <input
                    className="chat-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                />
                <div className="emoji-container" style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        className="emoji-toggle-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        😊
                    </button>
                    {showEmojiPicker && (
                        <div className="emoji-picker-container">
                            <EmojiPicker onEmojiClick={handleEmojiSelect} theme={theme} />
                        </div>
                    )}
                </div>
                <button className="chat-send-btn" onClick={handleSend}>Відправити</button>
            </div>
        </div>
    );
};

export default Chat;
