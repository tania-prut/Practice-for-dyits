import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Header from '../components/Header';
import axios from 'axios';
import Select from 'react-select';
import deleteIcon from '../assets/delete_icon.png';
import '../styles/Card.css';
import '../styles/collectionDetails.css';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

function CollectionDetails() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [booksOptions, setBooksOptions] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/collections/${id}`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(res => setCollection(res.data))
            .catch(err => console.error(err));
    }, [id]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/books`)
            .then(res => {
                const options = res.data.map(book => ({
                    value: book.id,
                    label: `${book.title} - ${book.author}`
                }));
                setBooksOptions(options);
            })
            .catch(err => console.error(err));
    }, []);

    const handleRemoveBook = (bookId) => {
        axios.delete(`${API_BASE_URL}/api/collections/${id}/books/${bookId}`, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(() => {
                setCollection(prev => ({
                    ...prev,
                    Books: prev.Books.filter(b => b.id !== bookId)
                }));
            })
            .catch(err => {
                console.error(err);
                setMessage('Помилка видалення книги з колекції');
            });
    };

    const filteredOptions = booksOptions.filter(opt =>
        !collection?.Books.some(book => book.id === opt.value)
    );

    const handleAddBooks = () => {
        const bookIds = selectedBooks.map(b => b.value);
        axios.post(`${API_BASE_URL}/api/collections/${id}/books`, { bookIds }, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
            .then(res => {
                setCollection(res.data);
                setShowAddModal(false);
                setSelectedBooks([]);
            })
            .catch(err => {
                console.error(err);
                setMessage('Помилка додавання книг до колекції');
            });
    };

    if (!collection) {
        return <div>Завантаження...</div>;
    }

    return (
        <>
            <Header />
            <div className="container collection-details-container">
                <h2>{collection.name}</h2>
                <p>Кількість книг: {collection.Books ? collection.Books.length : 0}</p>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Додати книги
                </Button>
                <div className="collection-details-row mt-3">
                    {collection.Books && collection.Books.map(book => (
                        <div key={book.id} className="collection-details-card">
                            <div style={{ position: 'relative' }}>
                                <div className="book-card">
                                    <img
                                        src={book.coverUrl || '/assets/no_book.png'}
                                        className="book-card__image"
                                        alt={book.title}
                                    />
                                    <div className="book-card__body">
                                        <img
                                            src={deleteIcon}
                                            alt="Видалити книгу"
                                            style={{
                                                position: 'absolute',
                                                bottom: '5px',
                                                right: '5px',
                                                width: '20px',
                                                cursor: 'pointer',
                                                backgroundColor: '#fff',
                                                borderRadius: '50%',
                                                padding: '2px'
                                            }}
                                            onClick={() => handleRemoveBook(book.id)}
                                        />
                                        <h5 className="book-card__title">{book.title}</h5>
                                        <p className="book-card__author">{book.author}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
                {message && <p className="text-danger">{message}</p>}

                <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Додати книги до колекції</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Select
                            options={filteredOptions}
                            isMulti
                            onChange={setSelectedBooks}
                            placeholder="Обрати книги..."
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Скасувати
                        </Button>
                        <Button variant="primary" onClick={handleAddBooks}>
                            Додати
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default CollectionDetails;
