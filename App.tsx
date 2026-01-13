
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from './constants';
import { User, Role } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Students from './pages/Students';
import FacultyPage from './pages/FacultyPage';
import SettingsPage from './pages/SettingsPage';
import PromotionSystem from './pages/PromotionSystem';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import ThemeToggle from './components/ThemeToggle';
import { Menu, X, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedUser = localStorage.getItem('kpt_session_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('kpt_session_user');
      }
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    localStorage.setItem('kpt_session_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab('dashboard');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kpt_session_user');
      setCurrentUser(null);
      setIsMenuOpen(false);
      setActiveTab('dashboard');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Logout failed:', err);
      setCurrentUser(null);
    }
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} onNavigate={setActiveTab} />;
      case 'attendance': return <Attendance user={currentUser} />;
      case 'reports': return <Reports user={currentUser} />;
      case 'students': return <Students user={currentUser} />;
      case 'faculty': return <FacultyPage user={currentUser} />;
      case 'promotion': return <PromotionSystem user={currentUser} />;
      case 'resources': return <Resources />;
      case 'contact': return <Contact />;
      case 'settings': return <SettingsPage user={currentUser} onLogout={handleLogout} />;
      default: return <Dashboard user={currentUser} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-100 selection:text-indigo-600">
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none text-slate-900 dark:text-white tracking-tight">KPT Pro</h1>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-600" /> {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 pr-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 dark:shadow-none">
                  {currentUser.name[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[80px]">{currentUser.name.split(' ')[0]}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{currentUser.role.split('_')[0]}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all border border-rose-100/50 dark:border-rose-900/30 group"
                title="Logout"
              >
                <LogOut size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-500 ease-out border-r border-slate-100 dark:border-slate-800 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-[12px] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100 dark:shadow-none">K</div>
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">Attendance</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <div className="px-4 py-2 mb-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Management Console</div>
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`${activeTab === item.id ? 'text-white' : 'text-slate-400'} transition-colors`}>{item.icon}</div>
                  <span className="font-black text-sm tracking-wide">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={18} strokeWidth={3} />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
