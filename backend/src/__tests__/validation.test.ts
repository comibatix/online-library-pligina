import { describe, test, expect } from 'vitest';

describe('Валидация данных', () => {
  test('OLID должен быть валидным форматом', () => {
    const validOlids = ['OL82560W', 'OL26438996W', 'OL81628W', 'OL1234567890M'];
    // Неверные: пустая строка, только цифры, только буквы, нет цифр, неверный суффикс, цифры в начале
    const invalidOlids = ['', '123', 'OL', 'OLW', 'OL123X', '123OL82560W'];
    
    const olidRegex = /^OL\d+[WM]$/;
    
    validOlids.forEach(olid => {
      expect(olidRegex.test(olid)).toBe(true);
    });
    
    invalidOlids.forEach(olid => {
      expect(olidRegex.test(olid)).toBe(false);
    });
  });

  test('статусы списка чтения должны быть валидными', () => {
    const validStatuses = ['want_to_read', 'reading', 'read'];
    const invalidStatuses = ['', 'unknown', 'finished', 'in_progress'];
    
    validStatuses.forEach(status => {
      expect(['want_to_read', 'reading', 'read']).toContain(status);
    });
    
    invalidStatuses.forEach(status => {
      expect(['want_to_read', 'reading', 'read']).not.toContain(status);
    });
  });

  test('email должен быть валидным', () => {
    const validEmails = ['test@example.com', 'user.name@domain.org', 'user+tag@domain.com'];
    const invalidEmails = ['', 'invalid', '@domain.com', 'user@', 'user@.com'];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});