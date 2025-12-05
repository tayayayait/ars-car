import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyVehicles, getLogs, updateMyVehicle, APIError } from '../services/api';
import { Vehicle, CallLog } from '../types';
import { Car, Clock, CheckCircle2, Pencil, X } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { validateModel, validatePlate4 } from '../services/validators';

export const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editPlate4, setEditPlate4] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editStatus, setEditStatus] = useState<Vehicle['status']>('active');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [v, l] = await Promise.all([
          getMyVehicles(user.id),
          getLogs(),
        ]);
        setVehicles(v);
        setLogs(l);
      } catch (err: unknown) {
        if (err instanceof APIError) {
          setError(
            err.message || '데이터를 불러오는 중 오류가 발생했습니다.',
          );
        } else if (err instanceof Error) {
          setError(
            err.message || '데이터를 불러오는 중 오류가 발생했습니다.',
          );
        } else {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatusInfo = (status: CallLog['callStatus']) => {
    switch(status) {
      case 'connected': return { label: '연결 성공', style: 'text-green-700 bg-green-100 ring-green-600/20' };
      case 'failed': return { label: '연결 실패', style: 'text-red-700 bg-red-100 ring-red-600/20' };
      case 'not_found': return { label: '정보 없음', style: 'text-orange-700 bg-orange-100 ring-orange-600/20' };
      case 'busy': return { label: '통화 중', style: 'text-yellow-700 bg-yellow-100 ring-yellow-600/20' };
      default: return { label: '알 수 없음', style: 'text-slate-700 bg-slate-100 ring-slate-600/20' };
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('ko-KR', { 
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const startEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditPlate4(vehicle.plateNumberLast4);
    setEditModel(vehicle.modelName);
    setEditStatus(vehicle.status);
    setEditError(null);
  };

  const sanitizePlate4Input = (value: string) =>
    value.replace(/\D/g, '').slice(0, 4);

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const plateError = validatePlate4(editPlate4);
    const modelError = validateModel(editModel);
    if (plateError || modelError) {
      setEditError(plateError || modelError);
      return;
    }

    if (!token) {
      setEditError('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await updateMyVehicle(token, editingVehicle.id, {
        plate4: editPlate4,
        model: editModel,
        status: editStatus,
      });
      setVehicles(prev =>
        prev.map(v => (v.id === updated.id ? updated : v)),
      );
      setEditingVehicle(null);
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setEditError(
          err.details && err.details.length > 0
            ? err.details[0]
            : err.message || '차량 정보 수정 중 오류가 발생했습니다.',
        );
      } else if (err instanceof Error) {
        setEditError(
          err.message || '차량 정보 수정 중 오류가 발생했습니다.',
        );
      } else {
        setEditError('차량 정보 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium animate-pulse">데이터를 불러오는 중입니다...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">로그인이 필요합니다</h1>
        <p className="text-slate-500 text-sm mb-6">
          내 차량 정보와 안심콜 기록은 로그인 후 확인할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md hover:bg-brand-700"
          >
            로그인하러 가기
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            회원가입
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">내 대시보드</h1>

      {error && (
        <div className="mb-6 text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Vehicles Section */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-600" /> 등록된 차량
          </h2>
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <PlusIcon /> 차량 추가
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map(v => (
            <div
              key={v.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Car className="w-24 h-24 text-brand-900" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    PLATE NUMBER
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                        v.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {v.status === 'active' ? '활성화됨' : '비활성화됨'}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditVehicle(v)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>수정</span>
                    </button>
                  </div>
                </div>
                <div className="text-4xl font-mono font-bold text-slate-800 mb-2 tracking-widest">{v.plateNumberLast4}</div>
                <div className="text-lg text-slate-600 font-semibold">{v.modelName}</div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                등록일: {new Date(v.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">등록된 차량이 없습니다.</p>
              <button
                className="mt-4 text-brand-600 font-bold hover:underline"
                onClick={() => navigate('/')}
              >
                차량 등록하기 &rarr;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Logs Section */}
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" /> 최근 안심콜 기록
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">아직 통화 기록이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">시간</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">차량 번호</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">발신자 (암호화)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">연결 상태</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">알림 발송</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => {
                    const status = getStatusInfo(log.callStatus);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatTime(log.timestamp)}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">{log.vehiclePlate}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs bg-slate-100 rounded-lg w-fit px-2 py-1 mx-6 inline-block text-center select-all">{log.callerPhoneHash}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${status.style}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.smsSent ? (
                            <span className="flex items-center gap-1.5 text-brand-600 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" /> 발송됨
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs font-medium px-2">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editingVehicle && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingVehicle(null)}
              className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              차량 정보 수정
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              차량 번호와 모델명을 수정할 수 있습니다. 번호를 변경하면 안심콜 연결에도 바로 반영됩니다.
            </p>

            {editError && (
              <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  차량 번호 (뒤 4자리)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    type="text"
                    maxLength={4}
                    className="w-full border-none bg-transparent text-sm font-mono tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    value={editPlate4}
                    onChange={e =>
                      setEditPlate4(sanitizePlate4Input(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  차량 이름/모델
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Car className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="flex-1 border-none bg-transparent text-sm focus:outline-none focus:ring-0"
                    value={editModel}
                    onChange={e => setEditModel(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  상태
                </span>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditStatus('active')}
                    className={`flex-1 rounded-xl border px-3 py-2 font-medium ${
                      editStatus === 'active'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    활성화
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('inactive')}
                    className={`flex-1 rounded-xl border px-3 py-2 font-medium ${
                      editStatus === 'inactive'
                        ? 'border-slate-500 bg-slate-100 text-slate-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    비활성화
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
                  disabled={editSaving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-700 disabled:opacity-60"
                >
                  {editSaving ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon: React.FC = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3.333v9.334M3.333 8h9.334"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
