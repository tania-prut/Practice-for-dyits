import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import Header from '../components/Header';
import CollectionModal from '../components/CollectionModal';
import { useNavigate } from 'react-router-dom';
import editingDark from '../assets/editing_dark.png';
import deleteIcon from '../assets/delete_icon.png';
import '../styles/Card.css';
import '../styles/collections.css';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function Collections() {
    const [collections, setCollections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/collections`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(res => setCollections(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleModalSubmit = (data) => {
        if (editingCollection) {
            axios.put(`${API_BASE_URL}/api/collections/${editingCollection.id}`, data, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
            })
                .then(res => {
                    const updatedCollections = collections.map(col =>
                        col.id === editingCollection.id ? res.data : col
                    );
                    setCollections(updatedCollections);
                    setEditingCollection(null);
                    setShowModal(false);
                    setMessage('');
                })
                .catch(err => {
                    console.error(err);
                    setMessage('Помилка оновлення колекції');
                });
        } else {
            axios.post(`${API_BASE_URL}/api/collections`, data, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
            })
                .then(res => {
                    setCollections([...collections, res.data]);
                    setShowModal(false);
                    setMessage('');
                })
                .catch(err => {
                    console.error(err);
                    setMessage('Помилка створення колекції');
                });
        }
    };

    const handleDelete = (collectionId) => {
        axios.delete(`${API_BASE_URL}/api/collections/${collectionId}`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(() => {
                setCollections(collections.filter(col => col.id !== collectionId));
            })
            .catch(err => console.error(err));
    };

    const handleEdit = (e, collection) => {
        e.stopPropagation();
        setEditingCollection(collection);
        setShowModal(true);
    };

    return (
        <>
            <Header />
            <div className="container collections-container">
                <h2>Мої колекції</h2>
                <Button variant="primary" onClick={() => {
                    setEditingCollection(null);
                    setShowModal(true);
                }}>
                    Створити нову колекцію
                </Button>
                <CollectionModal
                    show={showModal}
                    onHide={() => {
                        setShowModal(false);
                        setEditingCollection(null);
                    }}
                    onSubmit={handleModalSubmit}
                    initialData={editingCollection || {}}
                />
                <div className="collections-row mt-3">
                    {collections.map(col => (
                        <div key={col.id}>
                            <div className="card collection-card" onClick={() => navigate(`/collections/${col.id}`)}>
                                <img src={col.coverUrl} className="card-img-top" alt={col.name} />
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {col.name}
                                        <span className="card-count">({col.Books ? col.Books.length : 0})</span>
                                    </h5>
                                </div>
                                <div className="card-icons" onClick={(e) => e.stopPropagation()}>
                                    <img
                                        src={editingDark}
                                        alt="Редагувати"
                                        style={{ width: '20px', cursor: 'pointer' }}
                                        onClick={(e) => handleEdit(e, col)}
                                    />
                                    <img
                                        src={deleteIcon}
                                        alt="Видалити"
                                        style={{ width: '20px', cursor: 'pointer' }}
                                        onClick={() => handleDelete(col.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {message && <p className="text-danger">{message}</p>}
            </div>
        </>
    );
}

export default Collections;
