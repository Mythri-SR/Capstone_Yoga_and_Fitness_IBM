import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Trainers from './pages/Trainers.jsx';
import TrainerDetail from './pages/TrainerDetail.jsx';
import Programs from './pages/Programs.jsx';
import Book from './pages/Book.jsx';
import Sessions from './pages/Sessions.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/trainers/:id" element={<TrainerDetail />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/book" element={<Book />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
