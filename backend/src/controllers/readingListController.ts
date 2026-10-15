import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as readingListService from '../services/readingListService';

export const getUserReadingList = async (req: AuthRequest, res: Response) => {
  try {
    const readingList = await readingListService.getUserReadingList(req.userId!);
    res.status(200).json({ readingList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addToReadingList = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid, status } = req.body;
    if (!bookOlid || !status) {
      return res.status(400).json({ error: 'bookOlid и status обязательны' });
    }
    const item = await readingListService.addToReadingList(req.userId!, bookOlid, status);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateReadingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status обязателен' });
    }
    const item = await readingListService.updateReadingStatus(req.userId!, bookOlid, status);
    res.status(200).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeFromReadingList = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid } = req.params;
    await readingListService.removeFromReadingList(req.userId!, bookOlid);
    res.status(200).json({ message: 'Книга удалена из списка чтения' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};