import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import defaultAvatar from '../assets/default-avatar.png';
import nightModeIcon from '../assets/night-mode.png';
import bookClubIcon from '../assets/book-club.png';

const Header = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);

    let storedAvatarUrl = localStorage.getItem('avatarUrl');
    if (storedAvatarUrl) {
        storedAvatarUrl = storedAvatarUrl.replace(/\\/g, '/');
    }
    const avatarUrl = storedAvatarUrl || defaultAvatar;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('avatarUrl');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={bookClubIcon} alt="Book Club" style={{ height: '50px' }} />
                </Link>
                <div className="d-flex align-items-center">
                    <ul className="navbar-nav me-3 mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/collections">Моя колекція</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/library">Бібліотека</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Аналітика</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">Спільнота</Link>
                        </li>
                    </ul>
                    <div className="me-3">
                        <Link to="/profile">
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                        </Link>
                    </div>
                    <button onClick={toggleTheme} className="btn btn-outline-secondary btn-sm me-2">
                        <img src={nightModeIcon} alt="Toggle Theme" style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">
                        Вийти
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
