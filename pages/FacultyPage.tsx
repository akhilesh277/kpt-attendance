
import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Branch, Faculty, Role, Semester, FacultyAssignment, User } from '../types';
import { Search, Plus, Trash2, Edit2, X, Briefcase, PlusCircle, Link, Check, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const FacultyPage: React.FC<{ user: any }> = ({ user }) => {
  const [faculty, setFaculty] = useState<Faculty[]>(db.getFaculty());
  const [assignments, setAssignments] = useState<FacultyAssignment[]>(db.getAssignments());
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // facultyId
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  
  // Form States (HOD pre-restricted to their own branch)
  const [asgnData, setAsgnData] = useState({ 
    branch: (user.role === Role.HOD ? user.department : Branch.CS) as Branch, 
    semester: 1 as Semester, 
    subject: '' 
  });
  const [newFacultyData, setNewFacultyData] = useState({ name: '', employeeId: '', department: user.department || Branch.CS });
  
  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const filtered = useMemo(() => {
    let list = faculty;
    if (user.role === Role.HOD) {
      list = list.filter(f => f.department === user.department);
    }
    return list.filter(f => 
      f.name.toLowerCase().includes(search.toLowerCase()) || 
      f.employeeId.toLowerCase().includes(search.toLowerCase())
    );
  }, [faculty, search, user]);

  const triggerFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddFaculty = () => {
    if (!newFacultyData.name || !newFacultyData.employeeId) {
      return triggerFeedback('error', 'Please fill all fields');
    }

    if (faculty.some(f => f.employeeId === newFacultyData.employeeId)) {
      return triggerFeedback('error', 'Employee ID already exists');
    }

    const newFacId = Math.random().toString(36).substr(2, 9);
    
    const newFac: Faculty = {
      id: newFacId,
      name: newFacultyData.name,
      department: newFacultyData.department,
      employeeId: newFacultyData.employeeId,
      subjects: []
    };

    const newUser: User = {
      id: newFacId,
      username: newFacultyData.employeeId,
      password: 'password123',
      role: Role.FACULTY,
      name: newFacultyData.name,
      department: newFacultyData.department,
      employeeId: newFacultyData.employeeId
    };

    const updatedFaculty = [...faculty, newFac];
    const updatedUsers = [...db.getUsers(), newUser];

    setFaculty(updatedFaculty);
    db.saveFaculty(updatedFaculty);
    db.saveUsers(updatedUsers);
    db.logActivity(user.name, `Added new faculty: ${newFac.name} (${newFac.employeeId})`);

    setShowAddFacultyModal(false);
    setNewFacultyData({ name: '', employeeId: '', department: user.department || Branch.CS });
    triggerFeedback('success', 'Faculty added successfully!');
  };

  const handleAddAssignment = () => {
    if (!asgnData.subject) return triggerFeedback('error', 'Select a subject');
    
    // Final check for HOD boundary
    if (user.role === Role.HOD && asgnData.branch !== user.department) {
      return triggerFeedback('error', 'Unauthorized branch selection');
    }

    const newAsgn: FacultyAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      facultyId: showAssignModal!,
      branch: asgnData.branch,
      semester: asgnData.semester,
      subject: asgnData.subject
    };
    const updated = [...assignments, newAsgn];
    setAssignments(updated);
    db.saveAssignments(updated);
    setShowAssignModal(null);
    setAsgnData({ branch: (user.role === Role.HOD ? user.department : Branch.CS) as Branch, semester: 1, subject: '' });
    triggerFeedback('success', 'Class assigned successfully');
  };

  const removeAssignment = (id: string) => {
    if (!confirm('Remove this class assignment?')) return;
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    db.saveAssignments(updated);
    triggerFeedback('success', 'Assignment removed');
  };

  const deleteFaculty = (id: string) => {
    if (!confirm('Permanently delete this faculty and their user account?')) return;
    
    const updatedFac = faculty.filter(f => f.id !== id);
    const updatedUsers = db.getUsers().filter(u => u.id !== id);
    const updatedAsgns = assignments.filter(a => a.facultyId !== id);

    setFaculty(updatedFac);
    setAssignments(updatedAsgns);
    db.saveFaculty(updatedFac);
    db.saveUsers(updatedUsers);
    db.saveAssignments(updatedAsgns);
    
    db.logActivity(user.name, `Deleted faculty ID: ${id}`);
    triggerFeedback('success', 'Faculty profile deleted');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {feedback && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200' : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold">{feedback.msg}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Faculty Management</h2>
          <p className="text-slate-500 font-medium mt-1">Authorized load monitoring and class distribution.</p>
        </div>
        {(user.role === Role.SUPER_ADMIN || user.role === Role.HOD) && (
          <button 
            onClick={() => setShowAddFacultyModal(true)}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all scale-105 active:scale-95"
          >
            <Plus size={24} strokeWidth={3} /> Add Faculty
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
        <input 
          type="text" 
          placeholder="Search by faculty name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all font-bold"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filtered.map(f => {
          const teacherAsgns = assignments.filter(a => a.facultyId === f.id);
          return (
            <div key={f.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{f.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1.5">{f.employeeId} • {f.department}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                   {(user.role === Role.HOD || user.role === Role.SUPER_ADMIN) && (
                    <button 
                      onClick={() => {
                        setShowAssignModal(f.id);
                        setAsgnData(prev => ({ ...prev, branch: (user.role === Role.HOD ? user.department : Branch.CS) }));
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                    >
                      <PlusCircle size={14} /> Assign Class
                    </button>
                  )}
                  {user.role === Role.SUPER_ADMIN && (
                    <button onClick={() => deleteFaculty(f.id)} className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all self-end">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Institutional Workload</p>
                {teacherAsgns.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {teacherAsgns.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 group/item transition-all hover:bg-white dark:hover:bg-slate-800">
                        <div className="flex items-center gap-4">
                          <Link size={18} className="text-slate-300" />
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-lg">{a.subject}</span>
                            <div className="flex gap-2 mt-1.5">
                               <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded uppercase tracking-widest">SEM {a.semester}</span>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{a.branch.split(' ')[0]} Engg.</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeAssignment(a.id)} className="text-slate-300 hover:text-rose-600 p-3 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 px-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center bg-slate-50/50 dark:bg-slate-950/20">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Assignments</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Registration Modal */}
      {showAddFacultyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">New Faculty</h3>
              <button onClick={() => setShowAddFacultyModal(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Designation & Name</label>
                  <input 
                    type="text" 
                    value={newFacultyData.name} 
                    onChange={e => setNewFacultyData({...newFacultyData, name: e.target.value})} 
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-xl outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="Prof. Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">KPT Employee ID (Username)</label>
                  <input 
                    type="text" 
                    value={newFacultyData.employeeId} 
                    onChange={e => setNewFacultyData({...newFacultyData, employeeId: e.target.value})} 
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-xl outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="EMP_102"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Department</label>
                  <select 
                    disabled={user.role === Role.HOD}
                    value={newFacultyData.department} 
                    onChange={e => setNewFacultyData({...newFacultyData, department: e.target.value as Branch})} 
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-xl outline-none appearance-none disabled:opacity-60 text-slate-900 dark:text-white"
                  >
                    {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAddFaculty}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all mt-4 flex items-center justify-center gap-4 active:scale-95"
              >
                <UserPlus size={28} /> Complete Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Assignment Modal - RESTRICTED */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Finalize Class Load</h3>
              <button onClick={() => setShowAssignModal(null)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch Bound (Auto-Locked for HOD)</label>
                  <select 
                    disabled={user.role === Role.HOD}
                    value={asgnData.branch} 
                    onChange={e => setAsgnData({...asgnData, branch: e.target.value as Branch})} 
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 disabled:opacity-60 appearance-none text-slate-900 dark:text-white"
                  >
                    {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SEM Cycle</label>
                    <select value={asgnData.semester} onChange={e => setAsgnData({...asgnData, semester: Number(e.target.value) as Semester})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none appearance-none text-slate-900 dark:text-white">
                      {[1,2,3,4,5,6].map(s => <option key={s} value={s}>SEM {s}</option>)}
                    </select>
                  </div>
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject Code</label>
                    <select value={asgnData.subject} onChange={e => setAsgnData({...asgnData, subject: e.target.value})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none appearance-none text-slate-900 dark:text-white">
                      <option value="">Choose...</option>
                      {db.getSubjects().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleAddAssignment} 
                className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <CheckCircle size={32} strokeWidth={3} /> Finalize Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyPage;
