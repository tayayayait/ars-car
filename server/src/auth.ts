import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store, User } from './store';
import { requireAuth, AuthenticatedRequest } from './authMiddleware';
import { validatePhone, validatePassword } from './validators';

const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRES_IN = '7d';

interface JwtPayload {
  userId: string;
}

const createToken = (userId: string) =>
  jwt.sign({ userId } as JwtPayload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

const sanitizeUser = (user: User) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

authRouter.post('/api/auth/signup', async (req, res) => {
  const { phone, name, password } = req.body as {
    phone?: string;
    name?: string;
    password?: string;
  };

  if (!phone || !name || !password) {
    return res
      .status(400)
      .json({ message: 'phone, name, password 는 필수입니다.' });
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return res.status(400).json({ message: phoneError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const existing = store.users.find(u => u.phoneNumber === phone);
  if (existing && existing.passwordHash) {
    return res.status(400).json({ message: '이미 등록된 전화번호입니다.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user: User;
  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    user = existing;
  } else {
    user = {
      id: `u${Date.now()}`,
      phoneNumber: phone,
      name,
      passwordHash,
      role: 'user',
    };
    store.users.push(user);
  }

  const token = createToken(user.id);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

authRouter.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body as {
    phone?: string;
    password?: string;
  };

  if (!phone || !password) {
    return res
      .status(400)
      .json({ message: 'phone, password 는 필수입니다.' });
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return res.status(400).json({ message: phoneError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const user = store.users.find(u => u.phoneNumber === phone);
  if (!user || !user.passwordHash) {
    return res
      .status(400)
      .json({ message: '해당 전화번호의 계정을 찾을 수 없습니다.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
  }

  const token = createToken(user.id);
  return res.json({ token, user: sanitizeUser(user) });
});

authRouter.get('/api/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = store.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
  return res.json(sanitizeUser(user));
});

authRouter.put(
  '/api/me',
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    const { name, phone } = req.body as { name?: string; phone?: string };

    const user = store.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    // 실제 서비스에서는 전화번호 변경 시 추가 인증 절차가 필요합니다.
    if (typeof phone === 'string' && phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return res.status(400).json({ message: phoneError });
      }
      user.phoneNumber = phone.trim();
    }

    return res.json(sanitizeUser(user));
  },
);

export default authRouter;
