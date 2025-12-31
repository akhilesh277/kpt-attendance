
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { Branch, Semester, Student, AttendanceRecord, Role, FacultyAssignment } from '../types';
import { Save, Check, X, BookOpen, Layers, AlertCircle, Clock, ArrowLeft, ArrowUpDown, History, Edit3, ShieldAlert } from 'lucide-react';

interface AttendanceProps {
  user: any;
}

const Attendance: React.FC<AttendanceProps> = ({ user }) => {
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const isSunday = todayDate.getDay() === 0;

  // Assignments strictly for this faculty
  const myAssignments = useMemo(() => {
    const all = db.getAssignments();
    if (user.role === Role.FACULTY) {
      return all.filter(a => a.facultyId === user.id);
    }
    return [];
  }, [user]);

  const [selectedAsgnId, setSelectedAsgnId] = useState<string>(myAssignments[0]?.id || '');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(user.department || Branch.CS);
  const [selectedSem, setSelectedSem] = useState<Semester>(1);
  const [subject, setSubject] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'reg'>('name');
  
  const [attendance, setAttendance] = useState<Record<string, 'P' | 'A'>>({});
  const [isMarking, setIsMarking] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Security Verification: Can this user access this branch?
  const isAuthorized = useMemo(() => {
    if (user.role === Role.SUPER_ADMIN) return true;
    if (user.role === Role.HOD || user.role === Role.FACULTY) {
      return selectedBranch === user.department;
    }
    // Principal can view all but might be restricted from marking
    return true; 
  }, [selectedBranch, user]);

  // Sync state if Faculty
  useEffect(() => {
    if (user.role === Role.FACULTY && selectedAsgnId) {
      const found = myAssignments.find(a => a.id === selectedAsgnId);
      if (found) {
        setSelectedBranch(found.branch);
        setSelectedSem(found.semester);
        setSubject(found.subject);
      }
    }
  }, [selectedAsgnId, myAssignments, user]);

  const students = useMemo(() => {
    if (!isAuthorized) return [];
    let list = db.getStudents().filter(s => s.branch === selectedBranch && s.semester === selectedSem);
    return list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.regNumber.localeCompare(b.regNumber);
    });
  }, [selectedBranch, selectedSem, sortBy, isAuthorized]);

  const recentRecords = useMemo(() => {
    const all = db.getAttendance();
    // Faculty only see their own marks, HOD sees branch marks
    const baseFilter = user.role === Role.FACULTY 
      ? all.filter(r => r.markedBy === user.id)
      : all.filter(r => r.branch === user.department);

    return baseFilter
      .filter(r => r.date === todayStr)
      .slice(-5)
      .reverse();
  }, [attendance, todayStr, user]);

  const stats = useMemo(() => {
    const vals = Object.values(attendance);
    return {
      present: vals.filter(v => v === 'P').length,
      absent: vals.filter(v => v === 'A').length,
      total: students.length
    };
  }, [attendance, students]);

  const handleBack = () => {
    if (hasChanges) {
      if (!confirm('Are you sure you want to go back? Unsaved data will be lost.')) return;
    }
    setIsMarking(false);
    setHasChanges(false);
    setAttendance({});
  };

  const handleMark = (id: string, status: 'P' | 'A') => {
    setAttendance(p => ({...p, [id]: status}));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!isAuthorized) return alert('Unauthorized access attempt blocked.');
    if (!subject) return alert('Subject is required');
    if (isSunday) return alert('Cannot mark attendance on Sunday.');
    
    const records: AttendanceRecord[] = students.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      studentId: s.id,
      date: todayStr,
      status: attendance[s.id] || 'A',
      subject,
      semester: selectedSem,
      branch: selectedBranch,
      markedBy: user.id
    }));

    const existing = db.getAttendance();
    const filteredExisting = existing.filter(r => 
      !(r.date === todayStr && r.subject === subject && r.branch === selectedBranch && r.semester === selectedSem)
    );
    
    db.saveAttendance([...filteredExisting, ...records]);
    db.logActivity(user.name, `Saved attendance: ${subject} (${selectedBranch})`);
    alert('Attendance saved successfully!');
    setIsMarking(false);
    setHasChanges(false);
    setAttendance({});
  };

  const editRecent = (rec: AttendanceRecord) => {
    if (user.role === Role.HOD && rec.branch !== user.department) return;
    if (user.role === Role.FACULTY && rec.markedBy !== user.id) return;

    setSelectedBranch(rec.branch);
    setSelectedSem(rec.semester);
    setSubject(rec.subject);
    
    const all = db.getAttendance();
    const sessionRecords = all.filter(r => 
      r.date === rec.date && r.subject === rec.subject && r.branch === rec.branch && r.semester === rec.semester
    );
    const mapped: Record<string, 'P' | 'A'> = {};
    sessionRecords.forEach(r => mapped[r.studentId] = r.status);
    
    setAttendance(mapped);
    setIsMarking(true);
    setHasChanges(false);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Security Boundary</h2>
        <p className="text-slate-500 font-medium">
          You are attempting to access attendance records outside your assigned jurisdiction. 
          As a <strong>{user.role.replace('_', ' ')}</strong>, you only have authorization for <strong>{user.department}</strong>.
        </p>
        <button 
          onClick={() => setSelectedBranch(user.department)}
          className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
        >
          Return to My Department
        </button>
      </div>
    );
  }

  if (!isMarking) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">Attendance – Today</h2>
          <p className="text-slate-500 font-bold flex items-center justify-center gap-2 mt-2">
             <Clock size={18} className="text-indigo-600" /> {todayDate.toDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-sm space-y-8">
          {isSunday && (
            <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4">
              <AlertCircle className="text-amber-600" size={24} />
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Sunday Locked: Today is a non-working day. Attendance cannot be recorded.</p>
            </div>
          )}

          <div className="space-y-6">
            {user.role === Role.FACULTY ? (
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Choose Assigned Session</label>
                <select 
                  value={selectedAsgnId}
                  onChange={(e) => setSelectedAsgnId(e.target.value)}
                  className="w-full p-6 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black text-lg outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {myAssignments.map(a => (
                    <option key={a.id} value={a.id}>{a.subject} — Sem {a.semester} ({a.branch})</option>
                  ))}
                  {myAssignments.length === 0 && <option>No assignments from HOD</option>}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Branch Control</label>
                  <select 
                    disabled={user.role === Role.HOD}
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value as Branch)} 
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none disabled:opacity-60"
                  >
                    {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Semester</label>
                  <select value={selectedSem} onChange={(e) => setSelectedSem(parseInt(e.target.value) as Semester)} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Subject Identification</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none">
                    <option value="">Choose Predefined Subject...</option>
                    {db.getSubjects().map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button 
              disabled={isSunday || (user.role === Role.FACULTY && myAssignments.length === 0)}
              onClick={() => setIsMarking(true)}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Marking Session
            </button>
          </div>
        </div>

        {/* Recent History Preview - Strictly Filtered */}
        {recentRecords.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <History size={16} /> Recent {user.role === Role.FACULTY ? 'My Sessions' : 'Branch Activity'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRecords.map((rec, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between group hover:border-indigo-300 transition-colors shadow-sm">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{rec.subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem {rec.semester} • {rec.branch.split(' ')[0]}</p>
                  </div>
                  <button onClick={() => editRecent(rec)} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                    <Edit3 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={handleBack} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{subject}</h2>
            <div className="flex gap-2">
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">{selectedBranch.split(' ')[0]}</span>
               <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">Sem {selectedSem}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSortBy(s => s === 'name' ? 'reg' : 'name')}
            className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-800"
          >
            <ArrowUpDown size={18} /> {sortBy === 'name' ? 'By Reg' : 'By Name'}
          </button>
          <button onClick={handleSave} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all scale-105">
            <Save size={20} /> Finish & Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map(student => (
          <div key={student.id} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
            attendance[student.id] === 'P' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
            attendance[student.id] === 'A' ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800' :
            'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm'
          }`}>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">{student.regNumber}</p>
              <p className="font-black text-slate-900 dark:text-white text-lg leading-tight truncate">{student.name}</p>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={() => handleMark(student.id, 'P')}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  attendance[student.id] === 'P' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Check size={28} strokeWidth={4} />
              </button>
              <button 
                onClick={() => handleMark(student.id, 'A')}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  attendance[student.id] === 'A' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <X size={28} strokeWidth={4} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attendance;
