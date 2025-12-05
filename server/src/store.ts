import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  passwordHash?: string;
   role?: 'admin' | 'user';
}

export interface Vehicle {
  id: string;
  userId: string;
  plateNumberLast4: string;
  modelName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CallLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  callerPhoneHash: string;
  callStatus: 'connected' | 'failed' | 'busy' | 'not_found';
  timestamp: string;
  smsSent: boolean;
}

const adminPasswordHash = bcrypt.hashSync('admin1234', 10);

let users: User[] = [
  {
    id: 'u1',
    phoneNumber: '010-1234-5678',
    name: '홍길동',
    role: 'admin',
    passwordHash: adminPasswordHash,
  },
];

let vehicles: Vehicle[] = [
  {
    id: 'v1',
    userId: 'u1',
    plateNumberLast4: '1234',
    modelName: '현대 소나타',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

let callLogs: CallLog[] = [];

export const store = {
  users,
  vehicles,
  callLogs,
};
