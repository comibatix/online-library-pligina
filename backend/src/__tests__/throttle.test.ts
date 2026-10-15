import { describe, test, expect } from 'vitest';
import { throttledFetch, getQueueLength } from '../utils/openLibraryThrottle';

describe('OpenLibrary Throttle', () => {
  test('должен ограничивать частоту запросов', async () => {
    const startTime = Date.now();
    
    const promises = [
      throttledFetch('https://openlibrary.org/works/OL82560W.json'),
      throttledFetch('https://openlibrary.org/works/OL26438996W.json'),
      throttledFetch('https://openlibrary.org/works/OL81628W.json'),
    ];
    
    await Promise.all(promises);
    
    const elapsed = Date.now() - startTime;
    
    // 3 запроса с задержкой 1.1 сек = минимум 2.2 секунды
    expect(elapsed).toBeGreaterThanOrEqual(2000);
  });

  test('должен возвращать данные книги', async () => {
    const data = await throttledFetch('https://openlibrary.org/works/OL82560W.json');
    
    expect(data).toBeDefined();
    expect(data.title).toBeDefined();
    expect(typeof data.title).toBe('string');
  });

  test('очередь должна быть пустой после обработки', async () => {
    await throttledFetch('https://openlibrary.org/works/OL82560W.json');
    
    expect(getQueueLength()).toBe(0);
  });
});