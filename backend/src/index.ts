import express from 'express';
import cors from 'cors';
import { setupSwagger } from './utils/swagger';

import { register, login } from './controllers/authController';
import { searchBooks, getBookDetails, getBookLikes, getBookComments } from './controllers/booksController';
import { getUserLikes, addLike, removeLike } from './controllers/likesController';
import { getUserComments, createComment, updateComment, deleteComment } from './controllers/commentsController';
import { getUserReadingList, addToReadingList, updateReadingStatus, removeFromReadingList } from './controllers/readingListController';
import { getProfile, updateLogin, updatePassword, getUserById } from './controllers/profileController';
import { authMiddleware } from './middleware/authMiddleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger
setupSwagger(app);

// Auth
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Books (public)
app.get('/api/books/search', searchBooks);
app.get('/api/books/:olid', getBookDetails);
app.get('/api/books/:bookOlid/likes', getBookLikes);
app.get('/api/books/:bookOlid/comments', getBookComments);

// Likes (protected)
app.get('/api/likes', authMiddleware, getUserLikes);
app.post('/api/likes', authMiddleware, addLike);
app.delete('/api/likes/:bookOlid', authMiddleware, removeLike);

// Comments (protected)
app.get('/api/comments', authMiddleware, getUserComments);
app.post('/api/comments', authMiddleware, createComment);
app.put('/api/comments/:commentId', authMiddleware, updateComment);
app.delete('/api/comments/:commentId', authMiddleware, deleteComment);

// Reading List (protected)
app.get('/api/reading-list', authMiddleware, getUserReadingList);
app.post('/api/reading-list', authMiddleware, addToReadingList);
app.put('/api/reading-list/:bookOlid', authMiddleware, updateReadingStatus);
app.delete('/api/reading-list/:bookOlid', authMiddleware, removeFromReadingList);

// Profile (protected)
app.get('/api/profile', authMiddleware, getProfile);
app.put('/api/profile/login', authMiddleware, updateLogin);
app.put('/api/profile/password', authMiddleware, updatePassword);
app.get('/api/users/:userId', authMiddleware, getUserById);

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});

export default app;