import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function ProfileEdit() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        signature: '',
        about: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/user/profile`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(res => {
                setFormData({
                    name: res.data.name || '',
                    nickname: res.data.nickname || '',
                    signature: res.data.signature || '',
                    about: res.data.about || '',
                });
            })
            .catch(err => {
                setMessage('Помилка завантаження даних профілю');
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let avatarUrl = null;
            if (avatarFile) {
                const formDataFile = new FormData();
                formDataFile.append('avatar', avatarFile);
                const res = await axios.post(`${API_BASE_URL}/api/user/upload-avatar`, formDataFile, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
                avatarUrl = res.data.avatarUrl;
                localStorage.setItem('avatarUrl', avatarUrl);
            }
            await axios.put(`${API_BASE_URL}/api/user/profile`, {
                ...formData,
                avatarUrl,
            }, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
            });
            setMessage('Профіль оновлено успішно!');
            navigate('/profile');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Помилка оновлення профілю');
        }
    };

    return (
        <div>
            <Header />
            <div className="container mt-4">
                <h2>Редагування профілю</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Ім'я</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Нікнейм</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Підпис</label>
                        <input
                            type="text"
                            className="form-control"
                            name="signature"
                            value={formData.signature}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Про мене</label>
                        <textarea
                            className="form-control"
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Аватар (завантажити новий)</label>
                        <input type="file" className="form-control" onChange={handleFileChange} />
                    </div>
                    {message && <p className="text-danger">{message}</p>}
                    <button type="submit" className="btn btn-primary">Зберегти зміни</button>
                </form>
            </div>
        </div>
    );
}

export default ProfileEdit;
