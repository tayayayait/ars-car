import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from './store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const exists = store.users.find(u => u.id === decoded.userId);
    if (!exists) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }
    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  return requireAuth(req, res, () => {
    const user = store.users.find(u => u.id === req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    return next();
  });
};

