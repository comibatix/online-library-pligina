import bcrypt from 'bcrypt';
import * as usersRepo from '../repositories/usersRepository';

export const getProfile = async (userId: string) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  return { userId: user.id, login: user.login };
};

export const updateLogin = async (userId: string, newLogin: string, currentPassword: string) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Неверный пароль');
  }

  const existingUser = await usersRepo.findUserByLogin(newLogin);
  if (existingUser && existingUser.id !== userId) {
    throw new Error('Логин уже занят');
  }

  await usersRepo.updateUserLogin(userId, newLogin);
  return { userId, login: newLogin };
};

export const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Неверный текущий пароль');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await usersRepo.updateUserPassword(userId, newPasswordHash);
};

export const getUserById = async (userId: string) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  return { userId: user.id, login: user.login };
};