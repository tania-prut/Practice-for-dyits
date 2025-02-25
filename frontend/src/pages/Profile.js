// frontend/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import defaultAvatar from '../assets/default-avatar.png';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function Profile() {
    const [profile, setProfile] = useState({
        name: '',
        nickname: '',
        avatarUrl: '',
        signature: '',
        about: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                } else {
                    setMessage('Помилка завантаження профілю');
                }
            } catch (err) {
                console.error(err);
                setMessage('Помилка');
            }
        };
        fetchProfile();
    }, []);

    return (
        <div>
            <Header />
            <div className="container mt-4">
                <h2>Профіль користувача</h2>
                <div className="card p-3">
                    <div className="d-flex align-items-center">
                        <img
                            src={profile.avatarUrl || defaultAvatar}
                            alt="Avatar"
                            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                        />
                        <div className="ms-3">
                            <h4>{profile.name}</h4>
                            <p>{profile.nickname}</p>
                        </div>
                    </div>
                    <hr />
                    <p><strong>Підпис:</strong> {profile.signature}</p>
                    <p><strong>Про мене:</strong> {profile.about}</p>
                    <Link to="/profile/edit" className="btn btn-primary">Редагувати профіль</Link>
                </div>
                {message && <p className="text-danger mt-2">{message}</p>}
            </div>
        </div>
    );
}

export default Profile;
