import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Select from 'react-select';
import { Modal, Button, Form } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';

import plusBookIcon from '../assets/plus_book.png';
import noBookCover from '../assets/no_book.png';
import editingDark from '../assets/editing_dark.png';
import editingLight from '../assets/editing_light.png';
import bookmarkDark from '../assets/bookmark_dark.png';
import bookmarkLight from '../assets/bookmark_light.png';
import deleteIcon from '../assets/delete_icon.png';

import '../styles/App.css';
import '../styles/Card.css';
import '../styles/library.css';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

const Library = () => {
    const { theme } = useContext(ThemeContext);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [genresOptions, setGenresOptions] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        author: null,
        year: null,
        publisher: null,
        type: '',
        genres: [],
        sort: 'date_desc',
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        year: '',
        publisher: '',
        pages: '',
        isPrinted: false,
        type: '',
        genres: [],
    });
    const [coverFile, setCoverFile] = useState(null);
    const [addMessage, setAddMessage] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editMessage, setEditMessage] = useState('');

    const handleDeleteBook = async (bookId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/books/${bookId}`, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
            });
            setBooks(books.filter((book) => book.id !== bookId));
            setAddMessage('Книгу видалено успішно!');
        } catch (err) {
            console.error(err);
            setAddMessage(err.response.data.message || 'Помилка видалення книги');
        }
    };

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/api/books`)
            .then((res) => {
                const sorted = res.data.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setBooks(sorted);
                setFilteredBooks(sorted);
            })
            .catch((err) => console.error('Помилка завантаження книг:', err));

        axios
            .get(`${API_BASE_URL}/api/genres`)
            .then((res) => {
                const options = res.data.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                }));
                setGenresOptions(options);
            })
            .catch((err) => console.error('Помилка завантаження жанрів:', err));
    }, []);

    const uniqueAuthors = Array.from(new Set(books.map((b) => b.author))).map((author) => ({
        value: author,
        label: author,
    }));
    const uniquePublishers = Array.from(
        new Set(books.map((b) => b.publisher).filter((p) => p))
    ).map((pub) => ({ value: pub, label: pub }));

    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let y = currentYear; y >= 2000; y--) {
        yearOptions.push({ value: y.toString(), label: y.toString() });
    }
    yearOptions.push({ value: 'before2000', label: 'До 2000' });

    useEffect(() => {
        let result = [...books];
        if (filters.search) {
            result = result.filter((book) =>
                book.title.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        if (filters.author) {
            result = result.filter((book) => book.author === filters.author.value);
        }
        if (filters.year) {
            if (filters.year.value === 'before2000') {
                result = result.filter((book) => book.year && book.year < 2000);
            } else {
                result = result.filter((book) => String(book.year) === filters.year.value);
            }
        }
        if (filters.publisher) {
            result = result.filter((book) => book.publisher === filters.publisher.value);
        }
        if (filters.type) {
            result = result.filter((book) => book.type === filters.type);
        }
        if (filters.genres.length > 0) {
            result = result.filter((book) => {
                const bookGenreIds = book.Genres ? book.Genres.map((genre) => genre.id) : [];
                return filters.genres.some((genreId) => bookGenreIds.includes(genreId));
            });
        }
        switch (filters.sort) {
            case 'title_asc':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title_desc':
                result.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'year_asc':
                result.sort((a, b) => a.year - b.year);
                break;
            case 'year_desc':
                result.sort((a, b) => b.year - a.year);
                break;
            case 'date_asc':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setFilteredBooks(result);
    }, [filters, books]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearchChange = (e) => {
        handleFilterChange('search', e.target.value);
    };

    const handleNewBookChange = (e) => {
        setNewBook((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNewBookSelectGenres = (selected) => {
        const genreIds = selected ? selected.map((option) => option.value) : [];
        setNewBook((prev) => ({ ...prev, genres: genreIds }));
    };

    const handleFilterGenresChange = (selected) => {
        const genreIds = selected ? selected.map((option) => option.value) : [];
        handleFilterChange('genres', genreIds);
    };

    const handleCoverFileChange = (e) => {
        setCoverFile(e.target.files[0]);
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            let coverUrl = '';
            if (coverFile) {
                const formDataCover = new FormData();
                formDataCover.append('cover', coverFile);
                const resCover = await axios.post(`${API_BASE_URL}/api/books/upload-cover`, formDataCover, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });
                coverUrl = resCover.data.coverUrl;
            } else {
                coverUrl = noBookCover;
            }
            const payload = { ...newBook, coverUrl };
            const res = await axios.post(`${API_BASE_URL}/api/books`, payload, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
            });
            setBooks([res.data, ...books]);
            setAddMessage('Книгу додано успішно!');
            setShowAddModal(false);
            setNewBook({
                title: '',
                author: '',
                year: '',
                publisher: '',
                pages: '',
                isPrinted: false,
                type: '',
                genres: [],
            });
            setCoverFile(null);
        } catch (err) {
            setAddMessage(err.response.data.message || 'Помилка додавання книги');
        }
    };

    const handleOpenEditModal = (book) => {
        setSelectedBook(book);
        setShowEditModal(true);
    };

    const handleEditBookChange = (e) => {
        setSelectedBook((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditBookSelectGenres = (selected) => {
        const genreIds = selected ? selected.map((option) => option.value) : [];
        setSelectedBook((prev) => ({ ...prev, genres: genreIds }));
    };

    const handleEditCoverFileChange = (e) => {
        setCoverFile(e.target.files[0]);
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            let coverUrl = selectedBook.coverUrl;
            if (coverFile) {
                const formDataCover = new FormData();
                formDataCover.append('cover', coverFile);
                const resCover = await axios.post(`${API_BASE_URL}/api/books/upload-cover`, formDataCover, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });
                coverUrl = resCover.data.coverUrl;
            }
            const payload = { ...selectedBook, coverUrl };
            const res = await axios.put(`${API_BASE_URL}/api/books/${selectedBook.id}`, payload, {
                headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
            });
            setBooks(books.map((book) => (book.id === res.data.id ? res.data : book)));
            setShowEditModal(false);
            setSelectedBook(null);
            setCoverFile(null);
        } catch (err) {
            setEditMessage(err.response.data.message || 'Помилка оновлення книги');
        }
    };

    return (
        <>
            <Header />
            <div className="main-container">
                <div className="library-main">
                    {/* Верхній блок: Контролі пошуку і кнопка "Додати книгу" */}
                    <div className="library-header">
                        <div className="library-controls">
                            <div className="add-book-button">
                                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                    <img src={plusBookIcon} alt="Додати книгу" style={{ width: '20px', marginRight: '5px' }} />
                                    Додати книгу
                                </button>
                            </div>
                            <div className="search-box">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Пошук за назвою книги"
                                    value={filters.search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="library-content">
                        {/* Сітка книг */}
                        <div className="library-books-grid">
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => (
                                    <div key={book.id}>
                                        <div className="card book-card">
                                            <img
                                                src={book.coverUrl || noBookCover}
                                                className="card-img-top book-card__image"
                                                alt={book.title}
                                                style={{ objectFit: 'cover', height: '200px' }}
                                            />
                                            <div className="card-body book-card__body">
                                                <h5 className="card-title book-card__title">{book.title}</h5>
                                                <p className="card-text book-card__author">{book.author}</p>
                                            </div>
                                            <div
                                                className="card-icons"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '5px',
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <img
                                                    src={theme === 'light' ? editingDark : editingLight}
                                                    alt="Редагувати"
                                                    style={{ width: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleOpenEditModal(book)}
                                                />
                                                <img
                                                    src={theme === 'light' ? bookmarkDark : bookmarkLight}
                                                    alt="Додати до закладок"
                                                    style={{ width: '20px', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        // Логіка додавання до закладок
                                                    }}
                                                />
                                                <img
                                                    src={deleteIcon}
                                                    alt="Видалити"
                                                    style={{ width: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteBook(book.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Немає книг для відображення</p>
                            )}
                        </div>

                        {/* Блок фільтрів і сортування */}
                        <div className="library-filters">
                            <h5>Сортування</h5>
                            <Select
                                options={[
                                    { value: 'date_desc', label: 'За датою (новіші)' },
                                    { value: 'date_asc', label: 'За датою (старіші)' },
                                    { value: 'title_asc', label: 'За назвою (А-Я)' },
                                    { value: 'title_desc', label: 'За назвою (Я-А)' },
                                    { value: 'year_desc', label: 'За роком (новіші)' },
                                    { value: 'year_asc', label: 'За роком (старіші)' },
                                ]}
                                value={{
                                    value: filters.sort,
                                    label: {
                                        date_desc: 'За датою (новіші)',
                                        date_asc: 'За датою (старіші)',
                                        title_asc: 'За назвою (А-Я)',
                                        title_desc: 'За назвою (Я-А)',
                                        year_desc: 'За роком (новіші)',
                                        year_asc: 'За роком (старіші)',
                                    }[filters.sort],
                                }}
                                onChange={(option) => handleFilterChange('sort', option.value)}
                                className="mb-3"
                            />
                            <h5>Фільтри</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Автор</Form.Label>
                                <Select
                                    options={uniqueAuthors}
                                    value={filters.author}
                                    onChange={(selected) => handleFilterChange('author', selected)}
                                    placeholder="Обрати автора"
                                    isClearable
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Рік видання</Form.Label>
                                <Select
                                    options={yearOptions}
                                    value={filters.year}
                                    onChange={(selected) => handleFilterChange('year', selected)}
                                    placeholder="Обрати рік"
                                    isClearable
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Видавництво</Form.Label>
                                <Select
                                    options={uniquePublishers}
                                    value={filters.publisher}
                                    onChange={(selected) => handleFilterChange('publisher', selected)}
                                    placeholder="Обрати видавництво"
                                    isClearable
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Тип</Form.Label>
                                <Select
                                    options={[
                                        { value: '', label: 'Всі' },
                                        { value: 'цикл', label: 'Цикл' },
                                        { value: 'одиночна', label: 'Одиночна' },
                                    ]}
                                    value={filters.type ? { value: filters.type, label: filters.type } : { value: '', label: 'Всі' }}
                                    onChange={(selected) => handleFilterChange('type', selected.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Жанри</Form.Label>
                                <Select
                                    options={genresOptions}
                                    isMulti
                                    onChange={handleFilterGenresChange}
                                    placeholder="Обрати жанри"
                                />
                            </Form.Group>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                className={theme === 'dark' ? 'dark-modal' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Додати книгу</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddBook}>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Назва <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={newBook.title}
                                onChange={handleNewBookChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Автор <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="author"
                                value={newBook.author}
                                onChange={handleNewBookChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Рік видання</Form.Label>
                            <Form.Control
                                type="number"
                                name="year"
                                value={newBook.year}
                                onChange={handleNewBookChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Видавництво</Form.Label>
                            <Form.Control
                                type="text"
                                name="publisher"
                                value={newBook.publisher}
                                onChange={handleNewBookChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Кількість сторінок <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="number"
                                name="pages"
                                value={newBook.pages}
                                onChange={handleNewBookChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Наявність друкованої версії</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Є"
                                name="isPrinted"
                                checked={newBook.isPrinted}
                                onChange={(e) =>
                                    setNewBook((prev) => ({ ...prev, isPrinted: e.target.checked }))
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Тип <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                name="type"
                                value={newBook.type}
                                onChange={handleNewBookChange}
                                required
                            >
                                <option value="">Оберіть тип</option>
                                <option value="цикл">Цикл</option>
                                <option value="одиночна">Одиночна</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Жанри <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                                options={genresOptions}
                                isMulti
                                onChange={handleNewBookSelectGenres}
                                placeholder="Обрати жанри"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Обкладинка книги (необов’язково)</Form.Label>
                            <Form.Control
                                type="file"
                                name="cover"
                                onChange={handleCoverFileChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Додати книгу
                        </Button>
                    </Form>
                    {addMessage && <p className="mt-2">{addMessage}</p>}
                </Modal.Body>
            </Modal>

            {/* Модальне вікно для редагування книги */}
            <Modal
                show={showEditModal}
                onHide={() => {
                    setShowEditModal(false);
                    setSelectedBook(null);
                }}
                className={theme === 'dark' ? 'dark-modal' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Редагувати книгу</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBook && (
                        <Form onSubmit={handleEditBook}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Назва <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={selectedBook.title}
                                    onChange={handleEditBookChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Автор <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="author"
                                    value={selectedBook.author}
                                    onChange={handleEditBookChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Рік видання</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="year"
                                    value={selectedBook.year}
                                    onChange={handleEditBookChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Видавництво</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="publisher"
                                    value={selectedBook.publisher}
                                    onChange={handleEditBookChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Кількість сторінок <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    name="pages"
                                    value={selectedBook.pages}
                                    onChange={handleEditBookChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Наявність друкованої версії</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="Є"
                                    name="isPrinted"
                                    checked={selectedBook.isPrinted}
                                    onChange={(e) =>
                                        setSelectedBook((prev) => ({
                                            ...prev,
                                            isPrinted: e.target.checked,
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Тип <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="type"
                                    value={selectedBook.type}
                                    onChange={handleEditBookChange}
                                    required
                                >
                                    <option value="">Оберіть тип</option>
                                    <option value="цикл">Цикл</option>
                                    <option value="одиночна">Одиночна</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Жанри <span className="text-danger">*</span>
                                </Form.Label>
                                <Select
                                    options={genresOptions}
                                    isMulti
                                    onChange={handleEditBookSelectGenres}
                                    placeholder="Обрати жанри"
                                    defaultValue={
                                        selectedBook.Genres
                                            ? selectedBook.Genres.map((g) => ({ value: g.id, label: g.name }))
                                            : []
                                    }
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Обкладинка книги (необов’язково)</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="cover"
                                    onChange={handleEditCoverFileChange}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Зберегти зміни
                            </Button>
                        </Form>
                    )}
                    {editMessage && <p className="mt-2">{editMessage}</p>}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Library;
