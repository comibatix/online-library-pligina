import { getCache, setCache } from './cache';

interface QueueItem {
  url: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

const queue: QueueItem[] = [];
let isProcessing = false;
const DELAY_MS = 1100;

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    const { url, resolve, reject } = queue.shift()!;
    
    try {
      const cacheKey = 'throttle:' + url;
      let data = getCache(cacheKey);
      
      if (!data) {
        console.log('[Cache] MISS - throttle:', url);
        console.log('[OpenLibrary] Запрос:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn('[OpenLibrary] HTTP', response.status, 'для', url);
        }
        
        data = await response.json();
        setCache(cacheKey, data);
      } else {
        console.log('[Cache] HIT - throttle:', url);
      }
      
      resolve(data);
    } catch (error) {
      console.error('[OpenLibrary] Ошибка запроса', url + ':', error);
      reject(error);
    }
    
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  isProcessing = false;
};

export const throttledFetch = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    queue.push({ url, resolve, reject });
    processQueue();
  });
};

export const getQueueLength = (): number => queue.length;