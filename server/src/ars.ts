import { store, CallLog } from './store';

export type ARSAction = 'connect' | 'prompt' | 'play_audio';

export interface ARSResponse {
  action: ARSAction;
  targetNumber?: string;
  audioMessage?: string;
  meta?: any;
}

export const simulateIncomingCall = async (
  callerNumber: string,
  inputDigits: string,
): Promise<{ response: ARSResponse; log: CallLog }> => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  await delay(500);

  const callerHash = `***-${callerNumber.slice(-4)}`;
  const matchedVehicles = store.vehicles.filter(
    v => v.plateNumberLast4 === inputDigits && v.status === 'active',
  );

  let arsResponse: ARSResponse;
  let status: CallLog['callStatus'] = 'failed';
  let targetVehicleId = '';
  const targetVehiclePlate = inputDigits;

  if (matchedVehicles.length === 0) {
    arsResponse = {
      action: 'play_audio',
      audioMessage: '입력하신 번호로 등록된 차량을 찾을 수 없습니다.',
    };
    status = 'not_found';
  } else if (matchedVehicles.length === 1) {
    const v = matchedVehicles[0];
    const owner = store.users.find(u => u.id === v.userId);

    if (owner) {
      arsResponse = {
        action: 'connect',
        targetNumber: owner.phoneNumber,
        audioMessage: '차주와 연결합니다. 고객님의 번호는 노출되지 않습니다.',
      };
      status = 'connected';
      targetVehicleId = v.id;
    } else {
      arsResponse = {
        action: 'play_audio',
        audioMessage: '시스템 오류: 차주 정보를 찾을 수 없습니다.',
      };
      status = 'failed';
    }
  } else {
    arsResponse = {
      action: 'prompt',
      audioMessage: `등록된 차량이 여러 대입니다. ${matchedVehicles[0].modelName} 차량은 1번, ${matchedVehicles[1].modelName} 차량은 2번을 눌러주세요.`,
    };
    status = 'busy';
    targetVehicleId = matchedVehicles[0].id;
  }

  const newLog: CallLog = {
    id: `log${Date.now()}`,
    vehicleId: targetVehicleId,
    vehiclePlate: targetVehiclePlate,
    callerPhoneHash: callerHash,
    callStatus: status,
    timestamp: new Date().toISOString(),
    smsSent: true,
  };

  store.callLogs.push(newLog);

  return { response: arsResponse, log: newLog };
};

