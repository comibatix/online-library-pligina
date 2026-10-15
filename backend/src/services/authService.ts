import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usersRepo from '../repositories/usersRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (login: string, password: string) => {
  const existingUser = await usersRepo.findUserByLogin(login);
  if (existingUser) {
    throw new Error('Логин уже занят');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await usersRepo.createUser(login, passwordHash);

  const token = jwt.sign({ userId: user.id, login: user.login }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { user: { id: user.id, login: user.login }, token };
};

export const login = async (login: string, password: string) => {
  const user = await usersRepo.findUserByLogin(login);
  if (!user) {
    throw new Error('Неверный логин или пароль');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Неверный логин или пароль');
  }

  const token = jwt.sign({ userId: user.id, login: user.login }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { user: { id: user.id, login: user.login }, token };
};