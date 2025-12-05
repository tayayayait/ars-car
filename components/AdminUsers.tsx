import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Phone, Car, PhoneCall, Filter } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getAdminUsers, getAdminUserDetail, APIError } from '../services/api';
import { AdminUserSummary, AdminUserDetail } from '../types';

export const AdminUsers: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>(
    'all',
  );
  const [hasVehiclesOnly, setHasVehiclesOnly] = useState(false);

  useEffect(() => {
    if (!token || !user) return;
    if (user.role !== 'admin') return;

    const fetchUsers = async () => {
      setLoading(true);
      setListError(null);
      try {
        const list = await getAdminUsers(token, query);
        setUsers(list);
        if (list.length > 0 && !selected) {
          // 최초 로딩 시 첫 번째 사용자의 상세를불러옵니다.
          handleSelect(list[0].id, token);
        }
      } catch (err: unknown) {
        if (err instanceof APIError) {
          setListError(
            err.message || '회원 목록을 불러오는 중 오류가 발생했습니다.',
          );
        } else if (err instanceof Error) {
          setListError(
            err.message || '회원 목록을 불러오는 중 오류가 발생했습니다.',
          );
        } else {
          setListError('회원 목록을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, token, user]);

  const handleSelect = async (userId: string, authToken?: string) => {
    const effectiveToken = authToken || token;
    if (!effectiveToken) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await getAdminUserDetail(effectiveToken, userId);
      setSelected(detail);
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setDetailError(
          err.message || '상세 정보를 불러오는 중 오류가 발생했습니다.',
        );
      } else if (err instanceof Error) {
        setDetailError(
          err.message || '상세 정보를 불러오는 중 오류가 발생했습니다.',
        );
      } else {
        setDetailError('상세 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (hasVehiclesOnly && u.vehicleCount === 0) return false;
        return true;
      }),
    [users, roleFilter, hasVehiclesOnly],
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          관리자 권한이 필요합니다
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          이 페이지는 관리자 계정으로 로그인한 사용자만 접근할 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md hover:bg-brand-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-600" />
            관리자 - 회원 관리
          </h1>
          <p className="text-sm text-slate-500">
            가입된 회원을 검색하고, 차량 및 안심콜 기록을 한 눈에 확인하세요.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
        {/* Search */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="이름, 전화번호, 차량번호로 검색"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="w-3 h-3 text-slate-400" />
              <button
                type="button"
                onClick={() =>
                  setRoleFilter(prev =>
                    prev === 'all' ? 'user' : prev === 'user' ? 'admin' : 'all',
                  )
                }
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              >
                {roleFilter === 'all'
                  ? '역할: 전체'
                  : roleFilter === 'admin'
                  ? '역할: 관리자만'
                  : '역할: 일반만'}
              </button>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={hasVehiclesOnly}
                  onChange={e => setHasVehiclesOnly(e.target.checked)}
                />
                <span>차량 등록 회원만</span>
              </label>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            총{' '}
            <span className="font-semibold text-slate-600">
              {filteredUsers.length}
            </span>{' '}
            명 표시 중
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Users table */}
          <div className="lg:col-span-3 border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              회원 목록
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {listError && !loading && (
                <div className="px-4 py-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
                  {listError}
                </div>
              )}
              {loading ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  회원 목록을 불러오는 중입니다...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  조건에 맞는 회원이 없습니다.
                </div>
              ) : (
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold">
                        이름
                      </th>
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold">
                        연락처
                      </th>
                      <th className="px-3 py-2 text-center text-slate-500 font-semibold">
                        차량
                      </th>
                      <th className="px-3 py-2 text-center text-slate-500 font-semibold">
                        콜
                      </th>
                      <th className="px-3 py-2 text-center text-slate-500 font-semibold">
                        권한
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr
                        key={u.id}
                        className={`cursor-pointer hover:bg-slate-50 ${
                          selected?.user.id === u.id ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => handleSelect(u.id)}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-slate-800 text-xs md:text-sm">
                          {u.name || '(이름 없음)'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-600 text-xs md:text-sm">
                          {u.phoneNumber}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-700">
                          {u.vehicleCount}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-700">
                          {u.callCount}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {u.role === 'admin' ? '관리자' : '일반'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 border border-slate-100 rounded-xl">
            <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              상세 정보
            </div>
            <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
              {detailError && !detailLoading && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {detailError}
                </p>
              )}
              {detailLoading && (
                <p className="text-sm text-slate-500">
                  상세 정보를 불러오는 중입니다...
                </p>
              )}

              {!detailLoading && !selected && (
                <p className="text-sm text-slate-500">
                  왼쪽 목록에서 회원을 선택하면 상세 정보가 표시됩니다.
                </p>
              )}

              {selected && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selected.user.name || '(이름 없음)'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{' '}
                        {selected.user.phoneNumber}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      ID: {selected.user.id}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <Car className="w-3 h-3 text-brand-600" />
                      등록된 차량 ({selected.vehicles.length})
                    </p>
                    {selected.vehicles.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        등록된 차량이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selected.vehicles.map(v => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2"
                          >
                            <div>
                              <p className="font-mono font-semibold text-slate-800 tracking-[0.2em]">
                                {v.plateNumberLast4}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {v.modelName}
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              등록일:{' '}
                              {new Date(v.createdAt).toLocaleDateString(
                                'ko-KR',
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-brand-600" />
                      안심콜 기록 ({selected.calls.length})
                    </p>
                    {selected.calls.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        아직 안심콜 기록이 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {selected.calls.slice(0, 20).map(c => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between text-[11px] bg-slate-50 rounded-lg px-3 py-2"
                          >
                            <div>
                              <p className="font-mono text-slate-700">
                                {new Date(c.timestamp).toLocaleString('ko-KR', {
                                  month: 'numeric',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                차량: {c.vehiclePlate} / 발신자:{' '}
                                {c.callerPhoneHash}
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {c.callStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
