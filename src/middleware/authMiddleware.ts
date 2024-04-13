// src/middlewares/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
    userId?: string; 
}

export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; 
  }

  try {
    const decoded = jwt.verify(token, 'manug9704') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};