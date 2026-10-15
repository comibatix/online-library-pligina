import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as profileService from '../services/profileService';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await profileService.getProfile(req.userId!);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { newLogin, currentPassword } = req.body;
    if (!newLogin || !currentPassword) {
      return res.status(400).json({ error: 'newLogin и currentPassword обязательны' });
    }
    const profile = await profileService.updateLogin(req.userId!, newLogin, currentPassword);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword и newPassword обязательны' });
    }
    await profileService.updatePassword(req.userId!, currentPassword, newPassword);
    res.status(200).json({ message: 'Пароль обновлён' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await profileService.getUserById(userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};