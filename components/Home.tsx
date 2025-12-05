import React, { useState } from 'react';
import {
  Lock,
  PhoneIncoming,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { registerVehicle, registerMyVehicle, APIError } from '../services/api';
import { useAuth } from '../services/AuthContext';
import {
  validateModel,
  validatePhone,
  validatePlate4,
} from '../services/validators';

interface HomeProps {
  onRegisterSuccess: () => void;
}

export const Home: React.FC<HomeProps> = ({ onRegisterSuccess }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    plate4: '',
    phone: '',
    model: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const plateError = validatePlate4(formData.plate4);
    const modelError = validateModel(formData.model);
    const phoneError =
      user && token ? null : validatePhone(formData.phone || '');

    if (plateError || modelError || phoneError) {
      setError(plateError || modelError || phoneError);
      return;
    }

    setLoading(true);
    try {
      if (user && token) {
        await registerMyVehicle(token, formData.plate4, formData.model);
      } else {
        await registerVehicle(formData.phone, formData.plate4, formData.model);
      }
      setStep('success');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof APIError) {
        setError(
          err.details && err.details.length > 0
            ? err.details[0]
            : err.message || '등록에 실패했습니다. 다시 시도해주세요.',
        );
      } else if (err instanceof Error) {
        setError(err.message || '등록에 실패했습니다. 다시 시도해주세요.');
      } else {
        setError('등록에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'plate4') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, plate4: digits }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 text-center animate-fade-in">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">등록 완료!</h2>
        <p className="text-slate-600 mb-10 text-lg leading-relaxed">
          <strong>{formData.model} ({formData.plate4})</strong> 차량이 안전하게 등록되었습니다.<br/>
          이제 개인번호 노출 걱정 없이 주차하세요.
        </p>
        <button 
          onClick={onRegisterSuccess}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-xl shadow-brand-200 hover:-translate-y-1"
        >
          대시보드로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      <main className="flex-1 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-50 blur-3xl" />

        {/* Hero Section */}
        <section className="w-full relative">
          <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid gap-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1 text-[11px] font-medium text-sky-700 shadow-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
                PRIVACY FIRST PARKING
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-[2.35rem] leading-tight md:text-5xl font-semibold tracking-tight text-slate-900">
                  이중주차 연락,
                  <br className="hidden md:block" />
                  <span className="text-sky-600">번호 노출 없이 끝냅니다.</span>
                </h1>
                <p className="text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
                  SafeCall은 차량 번호 4자리만으로 차주와 연결되는, 전화번호가 노출되지 않는 ARS 주차 연락 서비스입니다.
                  이제 차 안에 휴대폰 번호를 남겨둘 필요가 없습니다.
                </p>
              </div>

              {/* CTA + Secondary */}
              {step === 'intro' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="px-7 py-3 rounded-full bg-sky-500 text-white text-sm md:text-base font-semibold shadow-md shadow-sky-200 hover:bg-sky-600 active:bg-sky-700 transition-colors flex items-center gap-2"
                  >
                    {user ? '내 차량 추가하기' : '무료 안심 번호 만들기'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1 text-[11px] md:text-xs text-slate-500">
                    <span>1분 가입 · 평생 무료 · 앱 설치 불필요</span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      현재 3,241대 차량이 SafeCall로 보호되고 있습니다.
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom mini features */}
              <div className="grid grid-cols-2 gap-4 max-w-md text-[11px] md:text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-sky-500 text-base">🔒</span>
                  <span>실제 번호가 노출되지 않는 ARS 연결</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-violet-500 text-base">⚡</span>
                  <span>전화 → 차량 번호 4자리 → 즉시 연결</span>
                </div>
              </div>
            </div>

            {/* Right: Phone mock / product card */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-sky-100/70 via-white to-emerald-50/80 rounded-[2.5rem] blur-2xl" />
              <div className="relative mx-auto w-full max-w-sm rounded-[2rem] bg-white shadow-xl shadow-slate-200 border border-slate-100 px-5 pt-5 pb-6 flex flex-col gap-4">
                {/* Phone header */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>1577-0000 · SafeCall ARS</span>
                  <span>00:32</span>
                </div>

                {/* Phone body */}
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-sky-500 flex items-center justify-center text-white text-sm font-semibold">
                      ARS
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">차량 번호 뒤 4자리를 눌러주세요.</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">예) 12가 3456 → 3456</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span className="font-medium text-slate-800">입력: 3 4 5 6</span>
                    <span className="text-emerald-500 font-medium">차주 정보 확인 완료</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 flex flex-col items-start gap-1 hover:border-sky-300 hover:bg-sky-50/60 transition-colors">
                    <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                      1번 · 통화 연결
                    </span>
                    <span className="text-[11px] text-slate-500">안심번호로 바로 통화 연결</span>
                  </button>
                  <button className="rounded-xl border border-slate-200 px-3 py-2 flex flex-col items-start gap-1 hover:border-emerald-300 hover:bg-emerald-50/70 transition-colors">
                    <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                      2번 · 문자 전송
                    </span>
                    <span className="text-[11px] text-slate-500">“잠시만 차량 이동 부탁드립니다.”</span>
                  </button>
                </div>

                <div className="mt-1 rounded-xl bg-slate-50 border border-dashed border-slate-200 px-3 py-2 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>차량에는 이 번호만 붙이면 됩니다.</span>
                  <span className="font-mono text-[11px] text-slate-700">1577-0000</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        {step === 'form' && (
          <div className="w-full max-w-lg px-4 -mt-10 mb-20 mx-auto relative z-10 animate-fade-in">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">차량 등록하기</h3>
              <p className="text-slate-500 mb-8">
                차량 번호와 {user ? '계정 정보' : '연락처'}를 입력하여 안심번호를 생성하세요.
              </p>

              {error && (
                <div className="mb-4 text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">차량 번호 (뒤 4자리)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="plate4"
                      value={formData.plate4}
                      onChange={handleInputChange}
                      placeholder="1234"
                      required
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-center text-3xl font-bold tracking-[0.5em] text-slate-800 placeholder:tracking-normal placeholder:text-slate-300"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
                      NUMBER
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!user && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">휴대폰 번호</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="010-0000-0000"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> 번호는 절대 노출되지 않습니다.
                      </p>
                    </div>
                  )}
                  <div className={user ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">차종</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="예: 현대 소나타"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors flex justify-center items-center shadow-lg shadow-brand-200"
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    '안심 번호 등록하기'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Value Props */}
        {step === 'intro' && (
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 pb-20">
            <FeatureCard
              icon={<Lock className="w-7 h-7" />}
              color="blue"
              title="완벽한 프라이버시"
              desc="개인 번호 대신 안심번호로 연결됩니다. ARS 시스템이 안전하게 중계합니다."
            />
            <FeatureCard
              icon={<PhoneIncoming className="w-7 h-7" />}
              color="indigo"
              title="즉각적인 연결"
              desc="전화를 거는 사람은 차량 번호 4자리만 누르면 즉시 차주와 연결됩니다."
            />
            <FeatureCard
              icon={<MessageSquare className="w-7 h-7" />}
              color="emerald"
              title="바이럴 안전 확산"
              desc="통화 후에는 상대방에게도 안심 주차 서비스를 추천하여 안전을 확산시킵니다."
            />
          </div>
        )}
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) => {
  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 ${colorStyles[color]} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  );
};
