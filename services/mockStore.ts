import { User, Vehicle, CallLog, ARSResponse } from '../types';

// Initial Mock Data
let users: User[] = [
  { id: 'u1', phoneNumber: '010-1234-5678', name: '홍길동' }
];

let vehicles: Vehicle[] = [
  { 
    id: 'v1', 
    userId: 'u1', 
    plateNumberLast4: '1234', 
    modelName: '현대 소나타', 
    status: 'active', 
    createdAt: new Date().toISOString() 
  }
];

let callLogs: CallLog[] = [];

// Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- User/Vehicle Services ---

export const registerVehicle = async (phone: string, plate4: string, model: string): Promise<Vehicle> => {
  await delay(800); // Simulate network
  
  // Check if user exists, if not create (Simulating Auth/User creation)
  let user = users.find(u => u.phoneNumber === phone);
  if (!user) {
    user = { id: `u${Date.now()}`, phoneNumber: phone, name: '신규 사용자' };
    users.push(user);
  }

  const newVehicle: Vehicle = {
    id: `v${Date.now()}`,
    userId: user.id,
    plateNumberLast4: plate4,
    modelName: model,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  vehicles.push(newVehicle);
  return newVehicle;
};

export const getMyVehicles = async (userId: string): Promise<Vehicle[]> => {
  await delay(300);
  return vehicles.filter(v => v.userId === userId);
};

export const updateMyVehicle = async (
  vehicleId: string,
  updates: {
    plate4?: string;
    model?: string;
    status?: Vehicle['status'];
  },
): Promise<Vehicle> => {
  await delay(300);

  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    throw new Error('차량을 찾을 수 없습니다.');
  }

  if (typeof updates.plate4 === 'string') {
    vehicle.plateNumberLast4 = updates.plate4;
  }
  if (typeof updates.model === 'string') {
    vehicle.modelName = updates.model;
  }
  if (typeof updates.status === 'string') {
    vehicle.status = updates.status;
  }

  return vehicle;
};

export const getLogs = async (): Promise<CallLog[]> => {
  await delay(300);
  return [...callLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// --- ARS Logic (Feature F2 & F3) ---

export const simulateIncomingCall = async (callerNumber: string, inputDigits: string): Promise<{ response: ARSResponse, log: CallLog }> => {
  await delay(1000); // Simulate connection time

  const callerHash = `***-${callerNumber.slice(-4)}`; // Simple hash simulation
  const matchedVehicles = vehicles.filter(v => v.plateNumberLast4 === inputDigits && v.status === 'active');
  
  let arsResponse: ARSResponse;
  let status: CallLog['callStatus'] = 'failed';
  let targetVehicleId = '';
  let targetVehiclePlate = inputDigits;

  if (matchedVehicles.length === 0) {
    arsResponse = {
      action: 'play_audio',
      audioMessage: '입력하신 번호로 등록된 차량을 찾을 수 없습니다.'
    };
    status = 'not_found';
  } else if (matchedVehicles.length === 1) {
    const v = matchedVehicles[0];
    const owner = users.find(u => u.id === v.userId);
    
    if (owner) {
      arsResponse = {
        action: 'connect',
        targetNumber: owner.phoneNumber, // In real world, this is handled by Twilio Bridge
        audioMessage: '차주와 연결합니다. 고객님의 번호는 노출되지 않습니다.'
      };
      status = 'connected';
      targetVehicleId = v.id;
    } else {
      arsResponse = { action: 'play_audio', audioMessage: '시스템 오류: 차주 정보를 찾을 수 없습니다.' };
      status = 'failed';
    }
  } else {
    // Multiple vehicles found (F2 logic)
    arsResponse = {
      action: 'prompt',
      audioMessage: `등록된 차량이 여러 대입니다. ${matchedVehicles[0].modelName} 차량은 1번, ${matchedVehicles[1].modelName} 차량은 2번을 눌러주세요.`
    };
    status = 'busy'; // Or 'pending_selection'
    targetVehicleId = matchedVehicles[0].id; // Defaulting for log
  }

  // Create Log
  const newLog: CallLog = {
    id: `log${Date.now()}`,
    vehicleId: targetVehicleId,
    vehiclePlate: targetVehiclePlate,
    callerPhoneHash: callerHash,
    callStatus: status,
    timestamp: new Date().toISOString(),
    smsSent: true // F3: Viral loop triggering
  };

  callLogs.push(newLog);

  return { response: arsResponse, log: newLog };
};

// For demo purposes, expose a way to reset
export const resetStore = () => {
  callLogs = [];
};
