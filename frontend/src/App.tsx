import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Profile from './pages/Profile';
import MyLikes from './pages/MyLikes';
import MyReadingList from './pages/MyReadingList';
import MyComments from './pages/MyComments';
import MyBooks from './pages/MyBooks';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white hover:text-pink-100 transition-colors flex items-center gap-2">
            <span className="text-3xl">📚</span>
            <span>Онлайн-библиотека</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-white font-medium mr-2">Привет, {user?.login}!</span>
                <button onClick={() => navigate('/my-likes')} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-sm font-medium">
                  ❤️ Мои лайки
                </button>
                <button onClick={() => navigate('/reading-list')} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-sm font-medium">
                   Список чтения
                </button>
                <button onClick={() => navigate('/my-comments')} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-sm font-medium">
                  💬 Комментарии
                </button>
                <button onClick={() => navigate('/profile')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-sm font-semibold shadow-md">
                  Профиль
                </button>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold shadow-md">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 font-medium">
                  Войти
                </button>
                <button onClick={() => navigate('/register')} className="bg-white text-indigo-600 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-md">
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:olid" element={<Layout><BookDetails /></Layout>} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-likes"
            element={
              <ProtectedRoute>
                <Layout><MyLikes /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading-list"
            element={
              <ProtectedRoute>
                <Layout><MyReadingList /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-comments"
            element={
              <ProtectedRoute>
                <Layout><MyComments /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <Layout><MyBooks /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;