import NodeCache from 'node-cache';
import axios from 'axios';

const cache = new NodeCache({ stdTTL: 7200 }); // 2 часа

let lastRequestTime = 0;
const MIN_INTERVAL = 1500; // 1.5 секунды между запросами — медленно, но надёжно

const throttle = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

export const searchBooks = async (query: string, page: number = 1, retries: number = 3) => {
  const cacheKey = `search_${query}_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[CACHE HIT] Поиск: ${query}, страница ${page}`);
    return cached;
  }

  console.log(`[CACHE MISS] Поиск: ${query}, страница ${page}`);
  await throttle();

  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q: query, page, limit: 20 },
      timeout: 60000 // 60 секунд
    });
    const data = response.data;
    if (!data || !data.docs) throw new Error('Некорректные данные');
    cache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error(`[ERROR] Поиск "${query}": ${error.message}`);
    if (retries > 0) {
      console.log(`[RETRY] Повтор через 3 сек (осталось ${retries})`);
      await new Promise(r => setTimeout(r, 3000));
      return searchBooks(query, page, retries - 1);
    }
    throw error;
  }
};

export const getBookDetails = async (olid: string, retries: number = 3) => {
  const cacheKey = `book_${olid}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[CACHE HIT] Книга: ${olid}`);
    return cached;
  }

  console.log(`[CACHE MISS] Книга: ${olid}`);
  await throttle();

  try {
    const endpoint = olid.endsWith('W') ? 'works' : 'books';
    const url = `https://openlibrary.org/${endpoint}/${olid}.json`;
    const response = await axios.get(url, {
      timeout: 60000 // 60 секунд
    });
    const data = response.data;
    cache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error(`[ERROR] Книга ${olid}: ${error.message}`);
    if (retries > 0) {
      console.log(`[RETRY] Повтор через 3 сек для ${olid} (осталось ${retries})`);
      await new Promise(r => setTimeout(r, 3000));
      return getBookDetails(olid, retries - 1);
    }
    throw error;
  }
};

export const getCoverUrl = (coverEditionKey: string, size: 'S' | 'M' | 'L' = 'M') => {
  if (!coverEditionKey) return null;
  return `https://covers.openlibrary.org/b/olid/${coverEditionKey}-${size}.jpg`;
};