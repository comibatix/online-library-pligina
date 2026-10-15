import NodeCache from 'node-cache';

// Кеш с TTL 30 минут (1800 секунд)
export const cache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T): void => {
  cache.set(key, value);
};

export const deleteCache = (key: string): void => {
  cache.del(key);
};

export const flushCache = (): void => {
  cache.flushAll();
};

// Статистика кеша (для отладки)
export const getCacheStats = () => {
  return cache.getStats();
};