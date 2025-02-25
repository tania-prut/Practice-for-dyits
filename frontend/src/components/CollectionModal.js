// frontend/src/components/CollectionModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000`;

const CollectionModal = ({ show, onHide, onSubmit, initialData = {} }) => {
    const [name, setName] = useState(initialData.name || '');
    const [coverUrl, setCoverUrl] = useState(initialData.coverUrl || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            const formData = new FormData();
            formData.append('cover', file);
            setUploading(true);
            try {
                const res = await axios.post(`${API_BASE_URL}/api/collections/upload-cover`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });
                setCoverUrl(res.data.coverUrl);
            } catch (err) {
                console.error(err);
            }
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !coverUrl) return;
        onSubmit({ name, coverUrl });
        setName('');
        setCoverUrl('');
        setSelectedFile(null);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-dark text-white">
                <Modal.Title>{initialData.id ? 'Редагувати колекцію' : 'Створити колекцію'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Назва колекції</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введіть назву"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Обкладинка</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            required={!coverUrl}
                        />
                        {uploading && <p>Завантаження...</p>}
                        {coverUrl && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={coverUrl} alt="Обкладинка" style={{ maxWidth: '100%' }} />
                            </div>
                        )}
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={uploading}>
                        {initialData.id ? 'Оновити' : 'Створити'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CollectionModal;
