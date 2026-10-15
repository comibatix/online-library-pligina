import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as commentsService from '../services/commentsService';

export const getUserComments = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await commentsService.getUserComments(req.userId!);
    res.status(200).json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookOlid, text } = req.body;
    if (!bookOlid || !text) {
      return res.status(400).json({ error: 'bookOlid и text обязательны' });
    }
    const comment = await commentsService.createComment(req.userId!, bookOlid, text);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text обязателен' });
    }
    const comment = await commentsService.updateComment(commentId, req.userId!, text);
    res.status(200).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    await commentsService.deleteComment(commentId, req.userId!);
    res.status(200).json({ message: 'Комментарий удалён' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};