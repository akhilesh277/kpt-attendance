
import React, { useMemo } from 'react';
import { Users, UserMinus, UserCheck, AlertTriangle, FileBarChart, ShieldAlert, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import { db } from '../services/db';
import { Role, Branch } from '../types';

interface DashboardProps {
  user: any;
  onNavigate?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const students = useMemo(() => db.getStudents(), []);
  const attendance = useMemo(() => db.getAttendance(), []);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const filteredStudents = useMemo(() => {
    if (user.role === Role.SUPER_ADMIN || user.role === Role.PRINCIPAL) return students;
    return students.filter(s => s.branch === user.department);
  }, [students, user]);

  const stats = useMemo(() => {
    const todaysAttendance = attendance.filter(a => a.date === todayStr);
    const presentToday = todaysAttendance.filter(a => a.status === 'P').length;
    const absentToday = todaysAttendance.filter(a => a.status === 'A').length;

    const studentAttendanceMap = new Map();
    attendance.forEach(a => {
      const current = studentAttendanceMap.get(a.studentId) || { p: 0, total: 0 };
      studentAttendanceMap.set(a.studentId, {
        p: current.p + (a.status === 'P' ? 1 : 0),
        total: current.total + 1
      });
    });

    let defaultersCount = 0;
    studentAttendanceMap.forEach(val => {
      if ((val.p / val.total) < 0.75) defaultersCount++;
    });

    return {
      total: filteredStudents.length,
      present: presentToday,
      absent: absentToday,
      defaulters: defaultersCount
    };
  }, [filteredStudents, attendance, todayStr]);

  const chartData = useMemo(() => {
    const branches = Object.values(Branch);
    return branches.map(b => {
      const count = students.filter(s => s.branch === b).length;
      return { name: b.split(' ')[0], students: count };
    });
  }, [students]);

  return (
    <div className="space-y-8">
      {/* Header with Institution Name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
            <MapPin size={14} /> Karnataka, Mangalore
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">KPT Mangalore</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.name} 👋</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Calendar className="text-indigo-600" size={24} />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Today's Date</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{today.toDateString()}</p>
          </div>
        </div>
      </div>

      {/* Special Faculty Action Card */}
      {user.role === Role.FACULTY && (
        <div className="grid grid-cols-1 gap-6">
          <button 
            onClick={() => onNavigate?.('attendance')}
            className="group relative overflow-hidden bg-indigo-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between"
          >
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-5 bg-white/20 rounded-3xl backdrop-blur-md">
                <UserCheck size={40} />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-black">Take Attendance</h2>
                <p className="text-indigo-100 font-medium">Mark presence for today's assigned sessions</p>
              </div>
            </div>
            <div className="relative z-10 p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
              <ArrowRight size={32} />
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Students" value={stats.total} icon={<Users size={20} />} color="bg-blue-500" />
        <StatCard title="Present Today" value={stats.present} icon={<UserCheck size={20} />} color="bg-emerald-500" />
        <StatCard title="Absent Today" value={stats.absent} icon={<UserMinus size={20} />} color="bg-rose-500" />
        <StatCard title="Defaulters" value={stats.defaulters} icon={<AlertTriangle size={20} />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" /> Department Enrollment
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 15}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-black mb-8 text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" /> Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate?.('attendance')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                <UserCheck size={28} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Marking</span>
            </button>
            <button onClick={() => onNavigate?.('reports')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                <FileBarChart size={28} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Reports</span>
            </button>
            <button onClick={() => onNavigate?.('students')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Directory</span>
            </button>
            <button onClick={() => onNavigate?.('settings')} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 transition-all group">
              <div className="p-4 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Security</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
