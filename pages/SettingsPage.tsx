
import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, Key, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut } from 'lucide-react';
import { db } from '../services/db';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<'main' | 'password' | 'permissions'>('main');
  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passData.new) return setStatus({ type: 'error', msg: 'Password cannot be empty' });
    if (passData.new !== passData.confirm) return setStatus({ type: 'error', msg: 'Passwords do not match' });
    
    const users = db.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    
    if (idx === -1) return setStatus({ type: 'error', msg: 'User profile mismatch' });
    
    users[idx].password = passData.new;
    db.saveUsers(users);
    db.logActivity(user.name, 'Changed account password');
    setStatus({ type: 'success', msg: 'Password updated successfully!' });
    setPassData({ new: '', confirm: '' });
  };

  const getPermissions = () => {
    switch(user.role) {
      case Role.SUPER_ADMIN: return ['Full System Control', 'User Management', 'Database Access', 'Configuration'];
      case Role.PRINCIPAL: return ['All Department Monitoring', 'Full Reports View', 'Activity Logs Review'];
      case Role.HOD: return ['Department Management', 'Faculty Assignment', 'Subject Controls', 'Student Records'];
      case Role.FACULTY: return ['Assigned Attendance Marking', 'View My Reports', 'Student Directory'];
      default: return [];
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your KPT Pro profile and security settings.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        {view === 'main' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
               <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 dark:shadow-none">
                 {user.name[0]}
               </div>
               <div>
                 <h3 className="font-black text-2xl text-slate-900 dark:text-white">{user.name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
                   {user.department && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{user.department}</span>}
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setView('password')} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all border border-slate-100 dark:border-slate-800 group">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><Key size={24} /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">Reset Password</p>
                    <p className="text-sm text-slate-500">Update your login security credentials</p>
                  </div>
                </div>
              </button>
              <button onClick={() => setView('permissions')} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all border border-slate-100 dark:border-slate-800 group">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">System Permissions</p>
                    <p className="text-sm text-slate-500">Review your role access levels</p>
                  </div>
                </div>
              </button>
              
              {/* Global Settings Logout Button */}
              <button onClick={onLogout} className="flex items-center justify-between p-6 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-[1.5rem] transition-all border border-rose-100 dark:border-rose-900/30 group">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform"><LogOut size={24} /></div>
                  <div>
                    <p className="font-bold text-rose-600 dark:text-rose-400 text-lg">Secure Logout</p>
                    <p className="text-sm text-slate-500">Terminate your current session</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {view === 'password' && (
          <form onSubmit={handlePassChange} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-black text-2xl">Reset Password</h3>
               <button type="button" onClick={() => { setView('main'); setStatus({ type: '', msg: '' }); }} className="px-5 py-2.5 text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">Discard</button>
            </div>
            
            {status.msg && (
              <div className={`p-5 rounded-3xl text-sm font-black flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {status.type === 'error' ? <AlertCircle size={24}/> : <CheckCircle2 size={24}/>}
                {status.msg}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Enter New Password</label>
                <div className="relative">
                  <input required type={showPass ? 'text' : 'password'} value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className="w-full p-6 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 bg-slate-50 outline-none focus:border-indigo-500 transition-all font-bold text-xl" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:text-indigo-600 transition-colors">{showPass ? <EyeOff size={24}/> : <Eye size={24}/>}</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Selection</label>
                <input required type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} className="w-full p-6 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 bg-slate-50 outline-none focus:border-indigo-500 transition-all font-bold text-xl" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all mt-4 scale-[1.02]">Save New Security Key</button>
          </form>
        )}

        {view === 'permissions' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between">
               <h3 className="font-black text-2xl">Access Scope</h3>
               <button onClick={() => setView('main')} className="px-4 py-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">Back</button>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-6">
                 <Shield className="text-emerald-500" size={24} />
                 <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Authorized as {user.role.replace('_', ' ')}</p>
               </div>
               <div className="grid grid-cols-1 gap-4">
                 {getPermissions().map(p => (
                   <div key={p} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-black p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-lg">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {p}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
