import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Book {
  olid: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  source: 'like' | 'reading';
}

const MyBooks: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredBooks(books.filter(b =>
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author_name && b.author_name.some(a => a.toLowerCase().includes(q))) ||
        b.olid.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, books]);

  const fetchMyBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const [likesRes, readingRes] = await Promise.all([
        axios.get('/api/likes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/reading-list', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const likeBooks: Book[] = (likesRes.data.likes || []).map((l: any) => ({
        olid: l.book_olid,
        source: 'like' as const
      }));

      const readingBooks: Book[] = (readingRes.data.readingList || []).map((r: any) => ({
        olid: r.book_olid,
        source: 'reading' as const
      }));

      const combined = [...likeBooks, ...readingBooks];
      const unique = combined.filter((book, index, self) =>
        index === self.findIndex(b => b.olid === book.olid)
      );

      setBooks(unique);
      setFilteredBooks(unique);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-500">Загружаем книги...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">🔍 Мои книги</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или автору..."
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
        />
      </div>

      <p className="text-gray-600 mb-4">Всего книг: {filteredBooks.length}</p>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg">
            {books.length === 0 ? 'У вас пока нет книг' : 'Ничего не найдено'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.olid}
              onClick={() => navigate(`/book/${book.olid}`)}
              className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="aspect-[2/3] mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={`https://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`}
                  alt={book.olid}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <p className="text-sm text-gray-600 mb-2 font-mono">{book.olid}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                book.source === 'like' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {book.source === 'like' ? '❤️ Лайк' : '📚 Чтение'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooks;