import {
  User,
  Vehicle,
  CallLog,
  ARSResponse,
  AdminUserSummary,
  AdminUserDetail,
} from '../types';
import * as mock from './mockStore';

const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = !API_BASE_URL;

const jsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

export class APIError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `API 요청 실패 (status: ${res.status})`;
    let details: string[] | undefined;

    const contentType = res.headers.get('Content-Type') || '';

    try {
      if (contentType.includes('application/json')) {
        const data = (await res.json()) as any;
        if (data && typeof data.message === 'string') {
          message = data.message;
        }
        if (Array.isArray(data?.errors)) {
          details = data.errors.filter((e: unknown) => typeof e === 'string');
        }
      } else {
        const text = await res.text();
        if (text) {
          message = text;
        }
      }
    } catch {
      // ignore parse errors and fall back to default message
    }

    throw new APIError(message, res.status, details);
  }
  return res.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const signup = async (
  name: string,
  phone: string,
  password: string,
): Promise<AuthResponse> => {
  if (USE_MOCK) {
    const user: User = {
      id: `mock-${Date.now()}`,
      phoneNumber: phone,
      name,
    };
    return { token: 'mock-token', user };
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ name, phone, password }),
  });

  return handleJsonResponse<AuthResponse>(res);
};

export const login = async (
  phone: string,
  password: string,
): Promise<AuthResponse> => {
  if (USE_MOCK) {
    const user: User = {
      id: 'u1',
      phoneNumber: phone,
      name: '데모 사용자',
    };
    return { token: 'mock-token', user };
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ phone, password }),
  });

  return handleJsonResponse<AuthResponse>(res);
};

export const getMe = async (token: string): Promise<User> => {
  if (USE_MOCK) {
    return {
      id: 'u1',
      phoneNumber: '010-1234-5678',
      name: '데모 사용자',
    };
  }

  const res = await fetch(`${API_BASE_URL}/api/me`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return handleJsonResponse<User>(res);
};

export const updateProfile = async (
  token: string,
  data: { name?: string; phone?: string },
): Promise<User> => {
  if (USE_MOCK) {
    return {
      id: 'u1',
      phoneNumber: data.phone || '010-1234-5678',
      name: data.name || '데모 사용자',
    };
  }

  const res = await fetch(`${API_BASE_URL}/api/me`, {
    method: 'PUT',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleJsonResponse<User>(res);
};

export const registerVehicle = async (
  phone: string,
  plate4: string,
  model: string,
): Promise<Vehicle> => {
  if (USE_MOCK) {
    return mock.registerVehicle(phone, plate4, model);
  }

  const res = await fetch(`${API_BASE_URL}/api/vehicles/register`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ phone, plate4, model }),
  });

  return handleJsonResponse<Vehicle>(res);
};

export const registerMyVehicle = async (
  token: string,
  plate4: string,
  model: string,
): Promise<Vehicle> => {
  if (USE_MOCK) {
    // 모의 환경에서는 기존 registerVehicle 로직을 재사용
    return mock.registerVehicle('010-0000-0000', plate4, model);
  }

  const res = await fetch(`${API_BASE_URL}/api/me/vehicles`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plate4, model }),
  });

  return handleJsonResponse<Vehicle>(res);
};

export const getMyVehicles = async (userId: string): Promise<Vehicle[]> => {
  if (USE_MOCK) {
    return mock.getMyVehicles(userId);
  }

  const res = await fetch(
    `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/vehicles`,
    {
      method: 'GET',
      headers: jsonHeaders,
    },
  );

  return handleJsonResponse<Vehicle[]>(res);
};

export const updateMyVehicle = async (
  token: string,
  vehicleId: string,
  updates: {
    plate4?: string;
    model?: string;
    status?: Vehicle['status'];
  },
): Promise<Vehicle> => {
  if (USE_MOCK) {
    return mock.updateMyVehicle(vehicleId, updates);
  }

  const res = await fetch(
    `${API_BASE_URL}/api/me/vehicles/${encodeURIComponent(vehicleId)}`,
    {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plate4: updates.plate4,
        model: updates.model,
        status: updates.status,
      }),
    },
  );

  return handleJsonResponse<Vehicle>(res);
};

export const getLogs = async (): Promise<CallLog[]> => {
  if (USE_MOCK) {
    return mock.getLogs();
  }

  const res = await fetch(`${API_BASE_URL}/api/logs`, {
    method: 'GET',
    headers: jsonHeaders,
  });

  return handleJsonResponse<CallLog[]>(res);
};

export const simulateIncomingCall = async (
  callerNumber: string,
  inputDigits: string,
): Promise<{ response: ARSResponse; log: CallLog }> => {
  if (USE_MOCK) {
    return mock.simulateIncomingCall(callerNumber, inputDigits);
  }

  const res = await fetch(`${API_BASE_URL}/api/simulate-call`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ callerNumber, inputDigits }),
  });

  return handleJsonResponse<{ response: ARSResponse; log: CallLog }>(res);
};

export const getAdminUsers = async (
  token: string,
  query?: string,
): Promise<AdminUserSummary[]> => {
  if (USE_MOCK) {
    return [];
  }

  const url = new URL(`${API_BASE_URL}/api/admin/users`);
  if (query) {
    url.searchParams.set('q', query);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return handleJsonResponse<AdminUserSummary[]>(res);
};

export const getAdminUserDetail = async (
  token: string,
  userId: string,
): Promise<AdminUserDetail> => {
  if (USE_MOCK) {
    return {
      user: {
        id: userId,
        phoneNumber: '010-0000-0000',
        name: '관리자(모의)',
        role: 'admin',
      },
      vehicles: [],
      calls: [],
    };
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
    },
  });

  return handleJsonResponse<AdminUserDetail>(res);
};
