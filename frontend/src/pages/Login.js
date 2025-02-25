// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage('Будь ласка, заповніть усі поля.');
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: formData.email,
                password: formData.password,
            });
            const token = res.data.token;
            localStorage.setItem('token', token);

            const profileRes = await axios.get(`${API_BASE_URL}/api/user/profile`, {
                headers: { Authorization: 'Bearer ' + token },
            });
            const { avatarUrl } = profileRes.data;
            if (avatarUrl) {
                localStorage.setItem('avatarUrl', avatarUrl);
            } else {
                localStorage.removeItem('avatarUrl');
            }

            navigate('/');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Помилка входу');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{ width: '350px' }}>
                <h2 className="mb-4 text-center">Вхід</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Електронна пошта
                        </label>
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
                        <label htmlFor="password" className="form-label">
                            Пароль
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Введіть ваш пароль"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Увійти
                    </button>
                </form>
                {message && <p className="text-danger mt-2 text-center">{message}</p>}
                <div className="text-center mt-3">
                    Не маєте акаунта? <Link to="/register">Зареєструватися</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
