import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Phone, Car, PlusCircle } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { registerMyVehicle, APIError } from '../services/api';
import {
  validateModel,
  validatePhone,
  validatePlate4,
} from '../services/validators';

export const Account: React.FC = () => {
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [plate4, setPlate4] = useState('');
  const [model, setModel] = useState('');
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleMessage, setVehicleMessage] = useState<string | null>(null);
  const sanitizePlate4Input = (value: string) =>
    value.replace(/\D/g, '').slice(0, 4);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          로그인 후 이용 가능합니다
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          내 정보와 차량 관리는 로그인한 사용자만 수정할 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md hover:bg-brand-700"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setProfileMessage(phoneError);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name, phone });
      setProfileMessage('프로필이 저장되었습니다.');
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setProfileMessage(
          err.details && err.details.length > 0
            ? err.details[0]
            : err.message || '프로필 저장 중 오류가 발생했습니다.',
        );
      } else if (err instanceof Error) {
        setProfileMessage(
          err.message || '프로필 저장 중 오류가 발생했습니다.',
        );
      } else {
        setProfileMessage('프로필 저장 중 오류가 발생했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setVehicleMessage(null);

    const plateError = validatePlate4(plate4);
    const modelError = validateModel(model);
    if (plateError || modelError) {
      setVehicleMessage(plateError || modelError);
      return;
    }

    setVehicleSaving(true);
    try {
      await registerMyVehicle(token, plate4, model);
      setVehicleMessage('차량이 등록되었습니다. 대시보드에서 확인하세요.');
      setPlate4('');
      setModel('');
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setVehicleMessage(
          err.details && err.details.length > 0
            ? err.details[0]
            : err.message || '차량 등록 중 오류가 발생했습니다.',
        );
      } else if (err instanceof Error) {
        setVehicleMessage(
          err.message || '차량 등록 중 오류가 발생했습니다.',
        );
      } else {
        setVehicleMessage('차량 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setVehicleSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          마이페이지
        </h1>
        <p className="text-sm text-slate-500">
          내 정보와 차량을 관리하고, 연락처를 최신 상태로 유지하세요.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-brand-600" /> 내 정보
          </h2>

          {profileMessage && (
            <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                이름
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                휴대폰 번호
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                실제 서비스에서는 전화번호 변경 시 별도 본인인증 절차가 필요합니다.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl shadow-md"
            >
              {saving ? '저장 중...' : '내 정보 저장'}
            </button>
          </form>
        </section>

        {/* Vehicle registration for logged-in user */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-600" /> 내 차량 등록
          </h2>

          {vehicleMessage && (
            <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              {vehicleMessage}
            </div>
          )}

          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                차량 번호 (뒤 4자리)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                <input
                  type="text"
                  maxLength={4}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-mono tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-400"
                  placeholder="예 : 12가 3456 → 3456"
                  value={plate4}
                  onChange={e => setPlate4(sanitizePlate4Input(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                차량 이름/모델
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
                <Car className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                  placeholder="예: 현대 소나타, 테슬라 모델 3"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={vehicleSaving}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{vehicleSaving ? '등록 중...' : '차량 등록하기'}</span>
            </button>
          </form>

          <p className="mt-3 text-[11px] text-slate-400">
            이미 등록한 차량은 &quot;대시보드&quot;에서 확인할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
};
