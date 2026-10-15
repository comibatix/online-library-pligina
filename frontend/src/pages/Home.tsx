import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const urlQuery = searchParams.get('q') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(urlQuery);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(urlPage);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(!!urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
    setPage(urlPage);
    if (urlQuery) {
      setHasSearched(true);
      performSearch(urlQuery, urlPage);
    }
  }, [urlQuery, urlPage]);

  const performSearch = async (searchQuery: string, searchPage: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/books/search', { params: { q: searchQuery, page: searchPage } });
      setBooks(res.data.docs || []);
      const numFound = res.data.numFound || res.data.num_found || 0;
      const calculatedPages = Math.ceil(numFound / 20);
      setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">Найди свою следующую книгу</h1>
        <p className="text-gray-600 text-lg">Миллионы книг из Open Library в одном месте</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название книги или автора..."
            className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-lg"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg text-lg"
          >
            Найти
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-500">Ищем книги...</p>
        </div>
      ) : !hasSearched ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-500 text-lg">Введите запрос для поиска книг</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">Книги не найдены. Попробуйте другой запрос.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.key}
                onClick={() => navigate(`/book/${book.key.split('/').pop()}`)}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="aspect-[2/3] mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">📖</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h3>
                {book.author_name && (
                  <p className="text-sm text-gray-600 mb-1">
                    {book.author_name.slice(0, 2).join(', ')}
                  </p>
                )}
                {book.first_publish_year && (
                  <p className="text-xs text-gray-400">{book.first_publish_year} г.</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Назад
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
            
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Вперёд →
            </button>
            
            <span className="ml-4 text-sm text-gray-500">
              Страница {page} из {totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;