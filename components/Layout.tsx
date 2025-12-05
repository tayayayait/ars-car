import React from 'react';
import { Shield, LayoutDashboard, Terminal, LogIn, LogOut, UserPlus, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="bg-brand-600 p-2 rounded-lg group-hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">SafeCall</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavButton 
              active={isActive('/')} 
              onClick={() => navigate('/')}
            >
              홈
            </NavButton>
            <NavButton 
              active={isActive('/dashboard')} 
              onClick={() => navigate('/dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
            >
              대시보드
            </NavButton>
            <NavButton 
              active={isActive('/simulation')} 
              onClick={() => navigate('/simulation')}
              icon={<Terminal className="w-4 h-4" />}
              className="text-purple-700 bg-purple-50 hover:bg-purple-100"
              activeClassName="bg-purple-100 text-purple-800"
            >
              시뮬레이터
            </NavButton>
            {!user && (
              <>
                <NavButton
                  active={isActive('/login')}
                  onClick={() => navigate('/login')}
                  icon={<LogIn className="w-4 h-4" />}
                >
                  로그인
                </NavButton>
                <NavButton
                  active={isActive('/signup')}
                  onClick={() => navigate('/signup')}
                  icon={<UserPlus className="w-4 h-4" />}
                  className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  activeClassName="bg-emerald-100 text-emerald-800"
                >
                  회원가입
                </NavButton>
              </>
            )}
            {user && (
              <>
                {user.role === 'admin' && (
                  <NavButton
                    active={isActive('/admin')}
                    onClick={() => navigate('/admin')}
                    icon={<Shield className="w-4 h-4" />}
                    className="text-amber-700 bg-amber-50 hover:bg-amber-100"
                    activeClassName="bg-amber-100 text-amber-800"
                  >
                    관리자
                  </NavButton>
                )}
                <NavButton
                  active={isActive('/account')}
                  onClick={() => navigate('/account')}
                  icon={<UserIcon className="w-4 h-4" />}
                  className="text-slate-600 bg-slate-50 hover:bg-slate-100"
                  activeClassName="bg-slate-100 text-slate-900"
                >
                  마이페이지
                </NavButton>
                <button
                  onClick={logout}
                  className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="font-semibold text-slate-700 mb-2">SafeCall Inc.</p>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SafeCall. 개인정보를 최우선으로 생각합니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Helper Component for Navigation Buttons
interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, children, icon, className, activeClassName }) => {
  const baseStyle = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
  const defaultActive = "text-brand-700 bg-brand-50 shadow-sm";
  const defaultInactive = "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  // Allow custom overrides
  const activeStyle = activeClassName || defaultActive;
  const inactiveStyle = className || defaultInactive;

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${active ? activeStyle : inactiveStyle}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
