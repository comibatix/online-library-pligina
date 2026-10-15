import { getCache, setCache } from '../utils/cache';
import { throttledFetch } from '../utils/openLibraryThrottle';
import * as likesRepo from '../repositories/likesRepository';
import * as commentsRepo from '../repositories/commentsRepository';

export const searchBooks = async (q: string, page: number = 1) => {
  const limit = 20;
  const cacheKey = `search:${q}:page:${page}:limit:${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
  const data = await throttledFetch(url);
  
  // Принудительно ограничиваем до 20 книг
  if (data && data.docs && data.docs.length > limit) {
    data.docs = data.docs.slice(0, limit);
  }
  
  setCache(cacheKey, data);
  return data;
};

export const getBookDetails = async (olid: string) => {
  const cacheKey = `book:${olid}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `https://openlibrary.org/works/${olid}.json`;
  const data = await throttledFetch(url);
  setCache(cacheKey, data);
  return data;
};

export const getBookLikesCount = async (bookOlid: string) => {
  return await likesRepo.getLikeCount(bookOlid);
};

export const getBookComments = async (bookOlid: string) => {
  return await commentsRepo.getBookComments(bookOlid);
};