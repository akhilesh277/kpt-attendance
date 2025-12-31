
import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Student, Role, PromotionLog, Semester } from '../types';
import { FastForward, Trash2, RotateCcw, CheckCircle2, AlertTriangle, History, X, ShieldCheck, UserX } from 'lucide-react';

const PromotionSystem: React.FC<{ user: any }> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [logs, setLogs] = useState<PromotionLog[]>(db.getPromotionLogs());
  const [showConfirm, setShowConfirm] = useState<'ODD' | 'EVEN' | null>(null);

  const archivedStudents = useMemo(() => students.filter(s => s.status === 'ARCHIVED'), [students]);
  const activeStudents = useMemo(() => students.filter(s => s.status !== 'ARCHIVED'), [students]);

  const handlePromotion = (type: 'ODD' | 'EVEN') => {
    const previousState = JSON.parse(JSON.stringify(students));
    let promotedCount = 0;

    const updatedStudents = students.map(s => {
      if (s.status === 'ARCHIVED') return s;

      promotedCount++;
      const nextSem = (s.semester + 1);

      if (nextSem > 6) {
        return { ...s, status: 'ARCHIVED' as const };
      } else {
        return { ...s, semester: nextSem as Semester };
      }
    });

    const newLog: PromotionLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      performedBy: user.name,
      type,
      studentCount: promotedCount,
      previousStates: previousState
    };

    const newLogs = [newLog, ...logs];
    db.saveStudents(updatedStudents);
    db.savePromotionLogs(newLogs);
    db.logActivity(user.name, `Performed Global SEM Promotion to ${type} Cycle`);

    setStudents(updatedStudents);
    setLogs(newLogs);
    setShowConfirm(null);
    alert(`Successfully promoted ${promotedCount} students!`);
  };

  const undoPromotion = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    if (!confirm('Are you sure you want to undo this promotion? All students will return to their previous semesters.')) return;

    db.saveStudents(log.previousStates);
    const newLogs = logs.filter(l => l.id !== logId);
    db.savePromotionLogs(newLogs);
    db.logActivity(user.name, `Undid Promotion from ${new Date(log.date).toLocaleDateString()}`);

    setStudents(log.previousStates);
    setLogs(newLogs);
  };

  const deleteArchived = (studentId: string) => {
    if (!confirm('Permanently delete this student record from Recycle Bin?')) return;
    const updated = students.filter(s => s.id !== studentId);
    db.saveStudents(updated);
    setStudents(updated);
    db.logActivity(user.name, `Permanently deleted archived student ID: ${studentId}`);
  };

  const restoreArchived = (studentId: string) => {
    const updated = students.map(s => s.id === studentId ? { ...s, status: 'ACTIVE' as const, semester: 6 as Semester } : s);
    db.saveStudents(updated);
    setStudents(updated);
    db.logActivity(user.name, `Restored student ID: ${studentId} from Recycle Bin`);
  };

  const clearRecycleBin = () => {
    if (!confirm('DANGER: This will permanently delete ALL students in the Recycle Bin. Continue?')) return;
    const updated = students.filter(s => s.status !== 'ARCHIVED');
    db.saveStudents(updated);
    setStudents(updated);
    db.logActivity(user.name, 'Cleared Recycle Bin');
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <FastForward size={36} className="text-indigo-600" />
          Global Semester Promotion
        </h2>
        <p className="text-slate-500 font-medium">Batch update all students to the next academic cycle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Promotion Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-indigo-600" />
            <h3 className="text-xl font-black">Promotion Cycle</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Switching to a new cycle increments the semester for all active students. Students completing the 6th Semester will be moved to the <strong>Recycle Bin</strong> automatically.
          </p>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <button 
              onClick={() => setShowConfirm('ODD')}
              className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-500 transition-all text-left"
            >
              <div>
                <p className="font-black text-lg text-slate-900 dark:text-white">Switch to ODD Cycle</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sems: 1, 3, 5</p>
              </div>
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <FastForward size={20} />
              </div>
            </button>

            <button 
              onClick={() => setShowConfirm('EVEN')}
              className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all text-left"
            >
              <div>
                <p className="font-black text-lg text-slate-900 dark:text-white">Switch to EVEN Cycle</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sems: 2, 4, 6</p>
              </div>
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                <FastForward size={20} />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Promotion Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="text-amber-500" />
            <h3 className="text-xl font-black">Promotion History</h3>
          </div>
          <div className="space-y-3 h-[280px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <History size={48} className="opacity-20" />
                <p className="text-sm font-bold">No promotion records found</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {log.type} Cycle <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 px-2 py-0.5 rounded uppercase">{log.studentCount} Students</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{new Date(log.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => undoPromotion(log.id)} className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Undo Promotion">
                    <RotateCcw size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recycle Bin Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Recycle Bin</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Students past 6th Semester</p>
            </div>
          </div>
          {archivedStudents.length > 0 && (
            <button onClick={clearRecycleBin} className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 dark:shadow-none">
               <UserX size={18} /> Final Clear All
            </button>
          )}
        </div>

        <div className="p-8">
          {archivedStudents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                 <CheckCircle2 size={40} className="text-emerald-500 opacity-30" />
               </div>
               <p className="font-bold">The Recycle Bin is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedStudents.map(s => (
                <div key={s.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between group">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white leading-tight">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.regNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => restoreArchived(s.id)} className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" title="Restore">
                      <RotateCcw size={18} />
                    </button>
                    <button onClick={() => deleteArchived(s.id)} className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all" title="Delete Permanently">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-10 text-center space-y-8">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <AlertTriangle size={56} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">Run Promotion?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are about to promote all active students to the <strong>{showConfirm} Cycle</strong>. This action affects {activeStudents.length} student records.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <button 
                onClick={() => handlePromotion(showConfirm)}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3"
               >
                 <CheckCircle2 size={24} /> Confirm Promotion
               </button>
               <button 
                onClick={() => setShowConfirm(null)}
                className="w-full py-4 text-slate-400 font-black hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionSystem;
