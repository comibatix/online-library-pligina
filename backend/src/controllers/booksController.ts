import { Request, Response } from 'express';
import * as booksService from '../services/booksService';

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    if (!q) {
      return res.status(400).json({ error: 'Параметр q обязателен' });
    }
    const data = await booksService.searchBooks(q, page);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookDetails = async (req: Request, res: Response) => {
  try {
    const { olid } = req.params;
    const data = await booksService.getBookDetails(olid);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookLikes = async (req: Request, res: Response) => {
  try {
    const { bookOlid } = req.params;
    const count = await booksService.getBookLikesCount(bookOlid);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookComments = async (req: Request, res: Response) => {
  try {
    const { bookOlid } = req.params;
    const comments = await booksService.getBookComments(bookOlid);
    res.status(200).json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};