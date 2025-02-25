import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Chat from '../components/Chat';
import axios from 'axios';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import '../styles/App.css';
import '../styles/Card.css';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function Main() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [recentBooks, setRecentBooks] = useState([]);
    const [sliderGap, setSliderGap] = useState(20);

    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const gapValue = rootStyles.getPropertyValue('--slider-gap').trim();
        const numericGap = parseInt(gapValue, 10) || 20;
        setSliderGap(numericGap);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        axios
            .get(`${API_BASE_URL}/api/user/profile`, {
                headers: { Authorization: 'Bearer ' + token },
            })
            .then((res) => {
                setCurrentUser({
                    id: res.data.id,
                    nickname: res.data.nickname,
                });
            })
            .catch((err) => {
                console.error('Помилка завантаження профілю', err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            });
    }, [navigate]);

    useEffect(() => {
        if (currentUser) {
            axios
                .get(`${API_BASE_URL}/api/collections/recentBooks`, {
                    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
                })
                .then((res) => {
                    const normalizedBooks = res.data.map((item) => {
                        if (item.coverUrl) {
                            if (item.coverUrl.startsWith('http')) {
                                return item;
                            }
                            return { ...item, coverUrl: `${API_BASE_URL}${item.coverUrl}` };
                        }
                        return item;
                    });
                    setRecentBooks(normalizedBooks);
                })
                .catch((err) => {
                    console.error('Помилка завантаження останніх книг', err);
                });
        }
    }, [currentUser]);

    if (!currentUser) {
        return <div>Завантаження...</div>;
    }

    return (
        <>
            <Header />
            <div className="main-container">
                <div className="row mt-3">
                    <div className="col-md-4 border-end" style={{ minHeight: '500px' }}>
                        <h5>Чат</h5>
                        <Chat currentUser={currentUser} />
                    </div>
                    <div className="col-md-8">
                        <h5>Моя колекція книг</h5>
                        {recentBooks.length > 0 ? (
                            <Swiper
                                modules={[Navigation]}
                                navigation
                                spaceBetween={sliderGap}
                                slidesPerView={5}
                                style={{ padding: '20px 0' }}
                            >
                                {recentBooks.map((item, index) => (
                                    <SwiperSlide key={item.bookId || item.id || index}>
                                        <div className="book-card">
                                            <img
                                                src={
                                                    item.coverUrl
                                                        ? item.coverUrl.startsWith('http')
                                                            ? item.coverUrl
                                                            : `${API_BASE_URL}${item.coverUrl}`
                                                        : '/assets/no_book.png'
                                                }
                                                alt={item.title}
                                                className="book-card__image"
                                            />
                                            <div className="book-card__body">
                                                <h6 className="book-card__title">{item.title}</h6>
                                                <p className="book-card__author">{item.author}</p>
                                                <p className="book-card__collection">
                                                    {item.collectionName}
                                                </p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <p>Немає книг для відображення</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Main;
