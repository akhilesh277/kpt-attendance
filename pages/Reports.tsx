
import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Branch, Semester, Role } from '../types';
import { Download, Filter, Search, ShieldAlert, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportsProps {
  user: any;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const isRestricted = user.role === Role.HOD || user.role === Role.FACULTY;
  const initialBranch = isRestricted ? user.department : Branch.CS;
  
  const [selectedBranch, setSelectedBranch] = useState<Branch>(initialBranch);
  const [selectedSem, setSelectedSem] = useState<Semester>(1);
  const [search, setSearch] = useState('');

  const hasAccess = useMemo(() => {
    if (user.role === Role.SUPER_ADMIN || user.role === Role.PRINCIPAL) return true;
    return selectedBranch === user.department;
  }, [selectedBranch, user]);

  const summary = useMemo(() => {
    if (!hasAccess) return [];
    
    // Faculty further filtered to only see their assigned semesters/classes 
    // but typically they view the whole SEM directory they handle.
    const students = db.getStudents().filter(s => s.branch === selectedBranch && s.semester === selectedSem);
    const attendance = db.getAttendance().filter(a => a.branch === selectedBranch && a.semester === selectedSem);

    return students.map(s => {
      const records = attendance.filter(a => a.studentId === s.id);
      const total = records.length;
      const present = records.filter(a => a.status === 'P').length;
      const percentage = total === 0 ? 0 : (present / total) * 100;
      
      return {
        ...s,
        totalClasses: total,
        presentClasses: present,
        percentage
      };
    }).filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedBranch, selectedSem, search, hasAccess]);

  const handleExport = () => {
    if (!hasAccess) return;
    const headers = ['Roll Number', 'Name', 'Total Classes', 'Present', 'Percentage', 'Status'];
    const rows = summary.map(s => [
      s.rollNumber,
      s.name,
      s.totalClasses,
      s.presentClasses,
      `${s.percentage.toFixed(2)}%`,
      s.percentage <= 75 ? 'Shortage' : 'Eligible'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `KPT_Report_${selectedBranch}_SEM${selectedSem}.csv`);
    link.click();
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-600 mb-8 animate-pulse">
          <ShieldAlert size={56} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Security Lockdown</h2>
        <p className="max-w-md text-slate-500 font-bold text-lg leading-relaxed">
          You are attempting to traverse into the <strong>{selectedBranch}</strong> data partition. 
          Your credentials strictly limit access to <strong>{user.department}</strong>.
        </p>
        <button 
          onClick={() => setSelectedBranch(user.department)}
          className="mt-10 px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
        >
          Return to My Sector
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" /> Boundary Access: {user.role.replace('_', ' ')} Profile
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-3 px-8 py-5 text-lg font-black text-white bg-indigo-600 rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95"
        >
          <Download size={22} strokeWidth={3} /> Export Excel/CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Branch</label>
            <select 
              disabled={isRestricted}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as Branch)}
              className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 transition-all disabled:opacity-60 appearance-none text-slate-900 dark:text-white"
            >
              {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Academic Semester</label>
            <select 
              value={selectedSem}
              onChange={(e) => setSelectedSem(parseInt(e.target.value) as Semester)}
              className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 appearance-none text-slate-900 dark:text-white"
            >
              {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Registry</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
              <input 
                type="text" 
                placeholder="Name or Roll No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem]">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400">
                <th className="px-8 py-2 text-left text-[11px] font-black uppercase tracking-[0.2em]">Student Profile</th>
                <th className="px-8 py-2 text-center text-[11px] font-black uppercase tracking-[0.2em]">Engagement Metrics</th>
                <th className="px-8 py-2 text-right text-[11px] font-black uppercase tracking-[0.2em]">Eligibility Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(item => (
                <tr key={item.id} className="bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                  <td className="px-8 py-6 rounded-l-[2rem]">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${item.percentage <= 75 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40'}`}>
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-xl leading-none">{item.name}</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{item.regNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-lg font-black text-slate-700 dark:text-slate-300">
                      {item.presentClasses} <span className="text-slate-300 mx-1">/</span> {item.totalClasses}
                    </p>
                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 overflow-hidden border border-white dark:border-slate-800 shadow-inner">
                       <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.percentage <= 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }} 
                       />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right rounded-r-[2rem]">
                    <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      item.percentage <= 75 
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' 
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                    }`}>
                      {item.percentage <= 75 ? <AlertCircle size={14} strokeWidth={3} /> : <CheckCircle2 size={14} strokeWidth={3} />}
                      {item.percentage.toFixed(1)}% {item.percentage <= 75 ? '• SHORTAGE' : '• ELIGIBLE'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary.length === 0 && (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-950/30 rounded-[3rem]">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-400 font-black text-xl uppercase tracking-widest">No Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
