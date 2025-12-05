import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Lock, Phone } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { APIError } from '../services/api';
import {
  validatePhone,
  validatePassword,
} from '../services/validators';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, phone, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setError(
          err.details && err.details.length > 0
            ? err.details[0]
            : err.message || '회원가입에 실패했습니다. 다시 시도해주세요.',
        );
      } else if (err instanceof Error) {
        setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">회원가입</h1>
        <p className="text-sm text-slate-500 mb-6">
          차량을 등록하고 SafeCall 안심 주차 서비스를 이용해 보세요.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              이름
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              휴대폰 번호
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
              <Phone className="w-4 h-4 text-slate-400" />
              <input
                type="tel"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                placeholder="010-1234-5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              비밀번호
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                placeholder="영문, 숫자 조합으로 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              비밀번호 확인
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                placeholder="비밀번호를 한 번 더 입력"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-brand-200 text-sm"
          >
            {loading ? '가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500 text-center">
          이미 계정이 있으신가요?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};
