
import React, { useState } from 'react';
import { db } from '../services/db';
import { LogIn, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface LoginProps {
  onLogin: (user: any) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 2️⃣ Reset the error every time user submits again
    setError('');
    
    // 1️⃣ & 3️⃣ Normalize username and password (trimmed whitespace, case-insensitive username)
    const inputUsername = username.trim().toLowerCase();
    const inputPassword = password.trim();

    // 1️⃣ Always fetch fresh users from db.getUsers() inside handleSubmit (do NOT cache)
    const users = db.getUsers();
    
    // 2️⃣ Replace current user check with a SAFE version
    const user = users.find(u => {
      // Comparison: exact match for username (case-insensitive) and password (trimmed)
      const storedUsername = u.username.trim().toLowerCase();
      const storedPassword = u.password ? u.password.trim() : '';
      return storedUsername === inputUsername && storedPassword === inputPassword;
    });
    
    if (user) {
      // 3️⃣ If user exists → call onLogin(user)
      setError('');
      onLogin(user);
    } else {
      // 4️⃣ If not → show proper error message
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
        <div className="p-10 bg-indigo-600 text-white text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md relative z-10">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black relative z-10">KPT Mangalore</h1>
          <p className="text-indigo-100 font-medium relative z-10">Attendance Management Pro</p>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-2xl border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              Credential: Username
            </label>
            <div className="relative group">
              <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(''); // Reset error on change
                }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:font-normal"
                placeholder="admin / hodcs / faccs1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              Security: Password
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Reset error on change
                }}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:font-normal"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transform active:scale-[0.98] transition-all shadow-2xl shadow-indigo-100 dark:shadow-none mt-4 text-lg"
          >
            <LogIn size={22} strokeWidth={3} /> Authenticate Session
          </button>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-relaxed">
              Karnataka (Govt.) Polytechnic Mangalore<br/>
              Institutional Portal • v2.0.1
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

// don't remove the previous chatbot personality behaviours'
// don't alter current look which is great and add looks
