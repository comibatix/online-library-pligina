import * as readingListRepo from '../repositories/readingListRepository';

const VALID_STATUSES = ['want_to_read', 'reading', 'read'];

export const getUserReadingList = async (userId: string) => {
  return await readingListRepo.getUserReadingList(userId);
};

export const addToReadingList = async (userId: string, bookOlid: string, status: string) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Неверный статус');
  }
  const isInList = await readingListRepo.isInReadingList(userId, bookOlid);
  if (isInList) {
    throw new Error('Книга уже в списке чтения');
  }
  return await readingListRepo.addToReadingList(userId, bookOlid, status);
};

export const updateReadingStatus = async (userId: string, bookOlid: string, status: string) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Неверный статус');
  }
  return await readingListRepo.updateReadingStatus(userId, bookOlid, status);
};

export const removeFromReadingList = async (userId: string, bookOlid: string) => {
  await readingListRepo.removeFromReadingList(userId, bookOlid);
};