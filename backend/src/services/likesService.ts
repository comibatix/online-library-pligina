import * as likesRepo from '../repositories/likesRepository';
import * as booksRepo from '../repositories/likesRepository';

export const getUserLikes = async (userId: string) => {
  return await likesRepo.getUserLikes(userId);
};

export const addLike = async (userId: string, bookOlid: string) => {
  const hasLike = await likesRepo.hasLike(userId, bookOlid);
  if (hasLike) {
    throw new Error('Лайк уже стоит');
  }
  return await likesRepo.addLike(userId, bookOlid);
};

export const removeLike = async (userId: string, bookOlid: string) => {
  await likesRepo.removeLike(userId, bookOlid);
};

export const getLikeCount = async (bookOlid: string) => {
  return await likesRepo.getLikeCount(bookOlid);
};