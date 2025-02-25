// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Library from './pages/Library';
import Collections from './pages/Collections';
import CollectionDetails from './pages/CollectionDetails';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<ProfileEdit />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/collections/:id" element={<CollectionDetails />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
