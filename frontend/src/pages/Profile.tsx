import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [newLogin, setNewLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.put('/api/profile/login', { newLogin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Логин обновлён!');
      setNewLogin('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.put('/api/profile/password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Пароль обновлён!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">👤 Профиль</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4">Информация</h2>
        <p className="text-gray-700 mb-2">Логин: <span className="font-semibold">{user?.login}</span></p>
        <p className="text-gray-500 text-sm">ID: {user?.id}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Сменить логин</h3>
        <form onSubmit={handleUpdateLogin}>
          <input
            type="text"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            placeholder="Новый логин"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            required
          />
          <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg">
            Обновить логин
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg mb-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Сменить пароль</h3>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Текущий пароль"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Новый пароль"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
            required
          />
          <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg">
            Обновить пароль
          </button>
        </form>
      </div>

      {message && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">{message}</div>}
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 font-semibold shadow-lg"
      >
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default Profile;
