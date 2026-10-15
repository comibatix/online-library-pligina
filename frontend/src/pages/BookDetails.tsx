import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface BookDetail {
  title: string;
  description?: string;
  authors?: any[];
  cover_i?: number;
  covers?: number[];
  first_publish_date?: string;
  first_publish_year?: number;
  olid: string;
}

interface Comment {
  id: string;
  user_id: string;
  user_login: string;
  text: string;
  created_at: string;
}

const BookDetails: React.FC = () => {
  const { olid } = useParams<{ olid: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentError, setCommentError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (olid) {
      fetchBook();
      fetchLikes();
      fetchComments();
      if (isAuthenticated) {
        fetchStatus();
      }
    }
  }, [olid, isAuthenticated]);

  const fetchBook = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/books/${olid}`);
      setBook(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки книги');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const countRes = await axios.get(`/api/books/${olid}/likes`);
      setLikesCount(countRes.data.count || 0);
      
      if (isAuthenticated && token) {
        const likesRes = await axios.get('/api/likes', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const userLikes = likesRes.data.likes || [];
        setIsLiked(userLikes.some((l: any) => l.book_olid === olid));
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/reading-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.readingList || [];
      const item = items.find((i: any) => i.book_olid === olid);
      setStatus(item ? item.status : null);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/books/${olid}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.delete(`/api/likes/${olid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
        setLikesCount(Math.max(0, likesCount - 1));
      } else {
        await axios.post('/api/likes', { bookOlid: olid }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (status) {
        await axios.put(`/api/reading-list/${olid}`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/reading-list', { bookOlid: olid, status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setStatus(newStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleRemoveStatus = async () => {
    try {
      await axios.delete(`/api/reading-list/${olid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!commentText.trim()) return;
    try {
      await axios.post('/api/comments', { bookOlid: olid, text: commentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText('');
      fetchComments();
    } catch (err: any) {
      setCommentError(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await axios.put(`/api/comments/${commentId}`, { text: editText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.map(c => c.id === commentId ? { ...c, text: editText } : c));
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      setCommentError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      setCommentError(err.response?.data?.error || 'Ошибка');
    }
  };

  const statusLabels: Record<string, string> = {
    want_to_read: 'Хочу прочитать',
    reading: 'Читаю',
    read: 'Прочитано',
  };

  const getAuthorsString = (authors: any) => {
    if (!authors || !Array.isArray(authors)) return 'Неизвестно';
    return authors.map((a: any) => {
      if (typeof a === 'string') return a;
      return a.name || a.author?.name || 'Неизвестно';
    }).filter(Boolean).join(', ') || 'Неизвестно';
  };

  const getCoverUrl = (bookData: BookDetail) => {
    const coverId = bookData.cover_i || (bookData.covers && bookData.covers[0]);
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-gray-500">Загружаем книгу...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || 'Книга не найдена'}</p>
        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg">
          На главную
        </button>
      </div>
    );
  }

  const coverUrl = getCoverUrl(book);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center gap-2 font-medium">
        ← Назад к поиску
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="aspect-[2/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">📖</div>
            )}
          </div>

          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">{book.title}</h1>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-gray-500 text-sm">Авторы</p>
                <p className="text-gray-800">{getAuthorsString(book.authors)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Год публикации</p>
                <p className="text-gray-800">
                  {book.first_publish_year || (book.first_publish_date ? new Date(book.first_publish_date).getFullYear() : 'Неизвестно')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Описание</p>
                <p className="text-gray-700 leading-relaxed">
                  {typeof book.description === 'string' ? book.description : (book.description ? 'Описание доступно на сайте Open Library' : 'Описание отсутствует')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg font-medium">
                <span className="text-pink-500">❤️</span>
                {likesCount} {likesCount === 1 ? 'лайк' : likesCount < 5 ? 'лайка' : 'лайков'}
              </span>
              
              {isAuthenticated && (
                <button
                  onClick={handleLike}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
                    isLiked
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  <span>❤️</span>
                  {isLiked ? 'Убрать лайк' : 'Поставить лайк'}
                </button>
              )}
            </div>

            {isAuthenticated && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Статус:</h3>
                <div className="flex flex-wrap gap-2">
                  {['want_to_read', 'reading', 'read'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        status === s
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                  {status && (
                    <button
                      onClick={handleRemoveStatus}
                      className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                    >
                      Убрать из списка
                    </button>
                  )}
                </div>
                {status && (
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      status === 'want_to_read' ? 'bg-purple-100 text-purple-700' :
                      status === 'reading' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {statusLabels[status]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 mt-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Комментарии ({comments.length})
        </h2>
        
        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Написать комментарий..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none resize-y min-h-[100px]"
            />
            <button
              type="submit"
              className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Отправить
            </button>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-indigo-800">
              <span className="font-semibold">Хотите оставить комментарий?</span>{' '}
              <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-800 font-semibold underline">Войдите</button>
              {' '}или{' '}
              <button onClick={() => navigate('/register')} className="text-indigo-600 hover:text-indigo-800 font-semibold underline">зарегистрируйтесь</button>
            </p>
          </div>
        )}

        {commentError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-medium">{commentError}</p>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500">Комментариев пока нет</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{comment.user_login}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {isAuthenticated && comment.user_id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium text-sm"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{comment.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;