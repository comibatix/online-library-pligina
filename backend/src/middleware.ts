import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем интерфейс Request, чтобы добавить поле user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    login: string;
  };
}

// Middleware для проверки JWT-токена
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    // Токен передаётся в формате "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; login: string };
    
    // Сохраняем данные пользователя в запрос, чтобы использовать в контроллерах
    req.user = decoded;
    
    next(); // Передаём управление дальше
  } catch (err) {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
};