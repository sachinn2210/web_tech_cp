import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import PostQuestion from './pages/PostQuestion';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import Achievements from './pages/Achievements';
import PostAchievement from './pages/PostAchievement';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/question/:id/edit" element={<PrivateRoute><PostQuestion /></PrivateRoute>} />
          <Route path="/post-question" element={<PrivateRoute><PostQuestion /></PrivateRoute>} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/post-achievement" element={<PrivateRoute><PostAchievement /></PrivateRoute>} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#1f1f25', color: '#e8e8f0', border: '1px solid #2e2e38' }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}