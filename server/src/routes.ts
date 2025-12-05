import { Router } from 'express';
import { store, User, Vehicle, CallLog } from './store';
import { simulateIncomingCall } from './ars';
import { requireAuth, AuthenticatedRequest } from './authMiddleware';
import { validatePhone, validatePlate4, validateModel } from './validators';

const router = Router();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/api/vehicles/register', async (req, res) => {
  const { phone, plate4, model } = req.body as {
    phone?: string;
    plate4?: string;
    model?: string;
  };

  if (!phone || !plate4 || !model) {
    return res
      .status(400)
      .json({ message: 'phone, plate4, model 은 필수입니다.' });
  }

  const errors: string[] = [];
  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);
  const plateError = validatePlate4(plate4);
  if (plateError) errors.push(plateError);
  const modelError = validateModel(model);
  if (modelError) errors.push(modelError);

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ message: '입력값이 올바르지 않습니다.', errors });
  }

  await delay(300);

  let user: User | undefined = store.users.find(u => u.phoneNumber === phone);
  if (!user) {
    user = {
      id: `u${Date.now()}`,
      phoneNumber: phone,
      name: '신규 사용자',
    };
    store.users.push(user);
  }

  const vehicle: Vehicle = {
    id: `v${Date.now()}`,
    userId: user.id,
    plateNumberLast4: plate4,
    modelName: model,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  store.vehicles.push(vehicle);

  return res.status(201).json(vehicle);
});

router.get('/api/users/:id/vehicles', async (req, res) => {
  const { id } = req.params;
  await delay(200);
  const result = store.vehicles.filter(v => v.userId === id);
  return res.json(result);
});

router.post(
  '/api/me/vehicles',
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { plate4, model } = req.body as {
      plate4?: string;
      model?: string;
    };

    if (!plate4 || !model) {
      return res
        .status(400)
        .json({ message: 'plate4, model 은 필수입니다.' });
    }

    const errors: string[] = [];
    const plateError = validatePlate4(plate4);
    if (plateError) errors.push(plateError);
    const modelError = validateModel(model);
    if (modelError) errors.push(modelError);

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ message: '입력값이 올바르지 않습니다.', errors });
    }

    if (!req.userId) {
      return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    await delay(200);

    const vehicle: Vehicle = {
      id: `v${Date.now()}`,
      userId: req.userId,
      plateNumberLast4: plate4,
      modelName: model,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    store.vehicles.push(vehicle);
    return res.status(201).json(vehicle);
  },
);

router.put(
  '/api/me/vehicles/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { plate4, model, status } = req.body as {
      plate4?: string;
      model?: string;
      status?: Vehicle['status'];
    };

    if (!req.userId) {
      return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    const vehicle = store.vehicles.find(
      v => v.id === id && v.userId === req.userId,
    );

    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    const errors: string[] = [];

    if (typeof plate4 === 'string') {
      const plateError = validatePlate4(plate4);
      if (plateError) errors.push(plateError);
    }

    if (typeof model === 'string') {
      const modelError = validateModel(model);
      if (modelError) errors.push(modelError);
    }

    if (typeof status === 'string') {
      if (status !== 'active' && status !== 'inactive') {
        errors.push('status 값이 올바르지 않습니다.');
      }
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ message: '입력값이 올바르지 않습니다.', errors });
    }

    await delay(200);

    if (typeof plate4 === 'string') {
      vehicle.plateNumberLast4 = plate4;
    }
    if (typeof model === 'string') {
      vehicle.modelName = model;
    }
    if (typeof status === 'string') {
      vehicle.status = status;
    }

    return res.json(vehicle);
  },
);

router.get('/api/logs', async (_req, res) => {
  await delay(200);
  const ordered = [...store.callLogs].sort(
    (a: CallLog, b: CallLog) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  return res.json(ordered);
});

router.post('/api/simulate-call', async (req, res) => {
  const { callerNumber, inputDigits } = req.body as {
    callerNumber?: string;
    inputDigits?: string;
  };

  if (!callerNumber || !inputDigits) {
    return res.status(400).json({
      message: 'callerNumber, inputDigits 는 필수입니다.',
    });
  }

  try {
    const result = await simulateIncomingCall(callerNumber, inputDigits);
    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'ARS 시뮬레이션 중 오류가 발생했습니다.' });
  }
});

export default router;
