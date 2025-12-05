import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User } from '../types';
import { AuthResponse, login as apiLogin, signup as apiSignup, updateProfile as apiUpdateProfile } from './api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'safecall_auth';

interface StoredAuth {
  token: string;
  user: User;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredAuth = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user && token) {
      const data: StoredAuth = { user, token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, token, loading]);

  const applyAuth = (res: AuthResponse) => {
    setUser(res.user);
    setToken(res.token);
  };

  const handleLogin = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiLogin(phone, password);
      applyAuth(res);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (
    name: string,
    phone: string,
    password: string,
  ) => {
    setLoading(true);
    try {
      const res = await apiSignup(name, phone, password);
      applyAuth(res);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { name?: string; phone?: string }) => {
    if (!token) return;
    setLoading(true);
    try {
      const updated = await apiUpdateProfile(token, data);
      setUser(prev => ({ ...(prev || updated), ...updated }));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        signup: handleSignup,
        updateProfile: handleUpdateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
};
