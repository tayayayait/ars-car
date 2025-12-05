import { Router } from 'express';
import { requireAdmin, AuthenticatedRequest } from './authMiddleware';
import { store, User, Vehicle, CallLog } from './store';

const adminRouter = Router();

const sanitizeUser = (user: User) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

adminRouter.get(
  '/api/admin/users',
  requireAdmin,
  (req: AuthenticatedRequest, res) => {
    const qRaw = (req.query.q as string | undefined) || '';
    const q = qRaw.trim().toLowerCase();

    const filteredUsers = store.users.filter(u => {
      if (!q) return true;
      const name = (u.name || '').toLowerCase();
      const phone = (u.phoneNumber || '').toLowerCase();
      const vehicles = store.vehicles.filter(v => v.userId === u.id);
      const plateMatch = vehicles.some(v =>
        v.plateNumberLast4.toLowerCase().includes(q),
      );
      return (
        name.includes(q) ||
        phone.includes(q) ||
        plateMatch
      );
    });

    const summaries = filteredUsers.map(u => {
      const vehicles = store.vehicles.filter(v => v.userId === u.id);
      const vehicleIds = vehicles.map(v => v.id);
      const callCount = store.callLogs.filter(c =>
        vehicleIds.includes(c.vehicleId),
      ).length;

      return {
        id: u.id,
        name: u.name,
        phoneNumber: u.phoneNumber,
        role: u.role || 'user',
        vehicleCount: vehicles.length,
        callCount,
      };
    });

    return res.json(summaries);
  },
);

adminRouter.get(
  '/api/admin/users/:id',
  requireAdmin,
  (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    const user = store.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const vehicles: Vehicle[] = store.vehicles.filter(v => v.userId === id);
    const vehicleIds = vehicles.map(v => v.id);
    const calls: CallLog[] = store.callLogs.filter(c =>
      vehicleIds.includes(c.vehicleId),
    );

    return res.json({
      user: sanitizeUser(user),
      vehicles,
      calls,
    });
  },
);

export default adminRouter;

