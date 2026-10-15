import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ReadingItem {
  id: string;
  book_olid: string;
  status: string;
  created_at: string;
}

interface BookMetadata {
  title: string;
  authors?: any[];
  cover_i?: number;
  covers?: number[];
}

const MyReadingList: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [bookMetadata, setBookMetadata] = useState<Record<string, BookMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, searchQuery]);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/reading-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.readingList || res.data || [];
      setItems(data);

      const metadata: Record<string, BookMetadata> = {};
      await Promise.all(
        data.map(async (item: ReadingItem) => {
          try {
            const bookRes = await axios.get(`/api/books/${item.book_olid}`);
            metadata[item.book_olid] = {
              title: bookRes.data.title || item.book_olid,
              authors: bookRes.data.authors,
              cover_i: bookRes.data.cover_i,
              covers: bookRes.data.covers
            };
          } catch (err) {
            metadata[item.book_olid] = { title: item.book_olid };
          }
        })
      );
      setBookMetadata(metadata);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookOlid: string, newStatus: string) => {
    try {
      await axios.put(`/api/reading-list/${bookOlid}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.map(i => i.book_olid === bookOlid ? { ...i, status: newStatus } : i));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка изменения статуса');
    }
  };

  const handleRemove = async (bookOlid: string) => {
    try {
      await axios.delete(`/api/reading-list/${bookOlid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(i => i.book_olid !== bookOlid));
      const newMetadata = { ...bookMetadata };
      delete newMetadata[bookOlid];
      setBookMetadata(newMetadata);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const getAuthorsString = (authors: any) => {
    if (!authors || !Array.isArray(authors)) return '';
    return authors.map((a: any) => {
      if (typeof a === 'string') return a;
      return a.name || a.author?.name || '';
    }).filter(Boolean).join(', ');
  };

  const getCoverUrl = (metadata: BookMetadata | undefined) => {
    if (!metadata) return null;
    const coverId = metadata.cover_i || (metadata.covers && metadata.covers[0]);
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
  };

  const filteredItems = items.filter(item => {
    const metadata = bookMetadata[item.book_olid];
    const q = searchQuery.toLowerCase();
    const title = metadata?.title?.toLowerCase() || '';
    const authors = getAuthorsString(metadata?.authors).toLowerCase();
    const matchesSearch = !searchQuery.trim() ||
      title.includes(q) ||
      authors.includes(q) ||
      item.book_olid.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusLabels: Record<string, string> = {
    want_to_read: 'Хочу прочитать',
    reading: 'Читаю',
    read: 'Прочитано',
  };

  const statusColors: Record<string, string> = {
    want_to_read: 'bg-purple-100 text-purple-700',
    reading: 'bg-blue-100 text-blue-700',
    read: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-500">Загружаем список...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">📚 Мой список чтения</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'want_to_read', 'reading', 'read'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === s
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'Все' : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или автору..."
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
        />
      </div>

      <p className="text-gray-600 mb-4">Всего книг: {filteredItems.length}</p>

      {paginatedItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">
            {items.length === 0 ? 'Список чтения пуст' : 'Ничего не найдено'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedItems.map((item) => {
              const metadata = bookMetadata[item.book_olid];
              const coverUrl = getCoverUrl(metadata);
              const authorsString = getAuthorsString(metadata?.authors);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
                >
                  <div
                    onClick={() => navigate(`/book/${item.book_olid}`)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-[2/3] mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={metadata?.title || item.book_olid}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📖</div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {metadata?.title || item.book_olid}
                    </h3>
                    {authorsString && (
                      <p className="text-sm text-gray-600 mb-2">
                        {authorsString}
                      </p>
                    )}
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {['want_to_read', 'reading', 'read'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(item.book_olid, s)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.status === s
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleRemove(item.book_olid)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                  >
                    Удалить
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
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
          )}
        </>
      )}
    </div>
  );
};

export default MyReadingList;