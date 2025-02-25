// src/pages/Register.js
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [registered, setRegistered] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setMessage('Будь ласка, заповніть усі поля.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage('Паролі не співпадають');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            setMessage('Реєстрація пройшла успішно!');
            setRegistered(true);
        } catch (err) {
            setMessage(err.response.data.message || 'Помилка реєстрації');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{ width: '350px' }}>
                <h2 className="mb-4 text-center">Реєстрація</h2>
                {registered ? (
                    <div className="text-center">
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary">Увійти</Link>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Ім'я</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    placeholder="Введіть ваше ім'я"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Електронна пошта</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Введіть вашу електронну пошту"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Пароль</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="Введіть пароль"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Підтвердіть пароль</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    placeholder="Підтвердіть пароль"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Зареєструватися</button>
                        </form>
                        <div className="text-center mt-3">
                            Вже маєте акаунт? <Link to="/login">Увійдіть</Link>
                        </div>
                        {message && (
                            <p className="text-danger mt-2 text-center">{message}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Register;
