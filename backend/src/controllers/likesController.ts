import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as likesService from '../services/likesService';

export const getUserLikes = async (req: AuthRequest, res: Response) => {
  try {
    const likes = await likesService.getUserLikes(req.userId!);
    res.status(200).json({ likes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addLike = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid } = req.body;
    if (!bookOlid) {
      return res.status(400).json({ error: 'bookOlid обязателен' });
    }
    await likesService.addLike(req.userId!, bookOlid);
    res.status(201).json({ message: 'Лайк добавлен' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeLike = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid } = req.params;
    await likesService.removeLike(req.userId!, bookOlid);
    res.status(200).json({ message: 'Лайк удалён' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLikeCount = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid } = req.params;
    const count = await likesService.getLikeCount(bookOlid);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};