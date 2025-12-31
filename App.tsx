
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
import ThemeToggle from './components/ThemeToggle';
import { Menu, X, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load theme and session on mount
  useEffect(() => {
    // Theme logic
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Restore session from persistent storage
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
    // Persist session
    localStorage.setItem('kpt_session_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab('dashboard');
    window.scrollTo(0, 0);
  };

  /**
   * REFINED LOGOUT PROTOCOL
   * This fix removes the window.location.replace() which caused the IP/DNS error.
   * Redirection is handled by React state nullification.
   */
  const handleLogout = () => {
    try {
      // 1. Storage Purge (Synchronous)
      localStorage.removeItem('kpt_session_user');
      localStorage.clear();
      sessionStorage.clear();

      // 2. State Reset
      // In React, setting state to null triggers a re-render.
      // The auth guard below (if !currentUser) will then automatically
      // catch this and display the Login component.
      setCurrentUser(null);
      setIsMenuOpen(false);
      setActiveTab('dashboard');

      // 3. Optional: Clear cookies manually
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
      }

      // Scroll to top for a clean login view
      window.scrollTo(0, 0);

    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback: force state change regardless of errors
      setCurrentUser(null);
    }
  };

  // Auth Guard: If no user is logged in, ALWAYS show the Login page.
  // This effectively acts as the "Redirect to Login Page"
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
      case 'settings': return <SettingsPage user={currentUser} onLogout={handleLogout} />;
      default: return <Dashboard user={currentUser} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-100 selection:text-indigo-600">
      {/* Top Header */}
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
              <h1 className="text-xl font-black leading-none text-slate-900 dark:text-white tracking-tight text-nowrap">KPT Pro</h1>
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

              {/* Header Logout Button */}
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

      {/* Side Drawer Component */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-500 ease-out border-r border-slate-100 dark:border-slate-800
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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
            
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 text-sm rounded-2xl transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'
                }`}
              >
                <UserIcon size={20} /> Settings
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-4 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-colors font-black text-left"
              >
                <LogOut size={20} /> Logout Session
              </button>
            </div>
          </nav>
          
          <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-indigo-600 shadow-sm">
                 {currentUser.name[0]}
               </div>
               <div className="overflow-hidden text-left">
                 <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none">{currentUser.name}</p>
                 <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1.5">{currentUser.role.replace('_', ' ')}</p>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
