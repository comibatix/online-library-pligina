import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: string;
  book_olid: string;
  text: string;
  created_at: string;
  updated_at: string;
}

interface BookMetadata {
  title: string;
  authors?: any[];
  cover_i?: number;
  covers?: number[];
}

const MyComments: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookMetadata, setBookMetadata] = useState<Record<string, BookMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/comments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const commentsData = res.data.comments || [];
      setComments(commentsData);

      const metadata: Record<string, BookMetadata> = {};
      await Promise.all(
        commentsData.map(async (comment: Comment) => {
          try {
            const bookRes = await axios.get(`/api/books/${comment.book_olid}`);
            metadata[comment.book_olid] = {
              title: bookRes.data.title || comment.book_olid,
              authors: bookRes.data.authors,
              cover_i: bookRes.data.cover_i,
              covers: bookRes.data.covers
            };
          } catch (err) {
            metadata[comment.book_olid] = { title: comment.book_olid };
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

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      await axios.put(`/api/comments/${commentId}`, { text: editText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.map(c => c.id === commentId ? { ...c, text: editText } : c));
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const paginatedComments = comments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-500">Загружаем комментарии...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">💬 Мои комментарии</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <p className="text-gray-600 mb-6">Всего комментариев: {comments.length}</p>

      {comments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500 text-lg">Вы ещё не оставляли комментариев</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedComments.map((comment) => {
              const metadata = bookMetadata[comment.book_olid];
              return (
                <div key={comment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <button
                      onClick={() => navigate(`/book/${comment.book_olid}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg"
                    >
                      {metadata?.title || comment.book_olid}
                    </button>
                    <p className="text-gray-400 text-sm">
                      {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditText(''); }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 mb-4">{comment.text}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </>
                  )}
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

export default MyComments;