
import React, { useState, useMemo, useRef } from 'react';
import { db } from '../services/db';
import { Branch, Semester, Student, Role } from '../types';
import { Search, UserPlus, Trash2, Edit2, X, FileUp, CheckCircle2, AlertCircle, Info, ChevronRight, XCircle, FileSpreadsheet, UploadCloud } from 'lucide-react';

const Students: React.FC<{ user: any }> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [uploadResults, setUploadResults] = useState<{ errors: string[], successCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Student>>({
    branch: user.department || Branch.CS,
    semester: 1,
    section: 'A'
  });

  const filtered = useMemo(() => {
    let list = students.filter(s => s.status !== 'ARCHIVED');
    if (user.role === Role.HOD || user.role === Role.FACULTY) {
      list = list.filter(s => s.branch === user.department);
    }
    return list.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search, user]);

  const handleSave = () => {
    if (!formData.name || !formData.regNumber) return alert('Name and Register Number are required');
    
    let updated;
    if (editingStudent) {
      updated = students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s);
      db.logActivity(user.name, `Updated student: ${formData.name}`);
    } else {
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name as string,
        age: 18,
        rollNumber: formData.rollNumber || formData.regNumber.slice(-5),
        regNumber: formData.regNumber as string,
        branch: formData.branch as Branch,
        semester: formData.semester as Semester,
        section: formData.section || 'A',
        status: 'ACTIVE'
      };
      updated = [...students, newStudent];
      db.logActivity(user.name, `Added student: ${newStudent.name}`);
    }

    setStudents(updated);
    db.saveStudents(updated);
    setShowAddModal(false);
    setEditingStudent(null);
    setFormData({ branch: user.department || Branch.CS, semester: 1, section: 'A' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkText(text);
      triggerProcessing(text);
    };
    reader.readAsText(file);
  };

  const triggerProcessing = (input: string) => {
    setUploadResults(null);
    const lines = input.trim().split('\n');
    if (lines.length === 0 || !input.trim()) return;

    const errors: string[] = [];
    const validatedStudents: Student[] = [];

    lines.forEach((line, index) => {
      const rowNum = index + 1;
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 3) {
        errors.push(`Row ${rowNum}: Insufficient data (Name, Register, Branch required)`);
        return;
      }

      const [name, reg, branchRaw] = parts;
      
      if (!name || !reg || !branchRaw) {
        errors.push(`Row ${rowNum}: Empty fields detected`);
        return;
      }

      const normalizedBranch = db.normalizeBranch(branchRaw);
      if (!normalizedBranch) {
        errors.push(`Row ${rowNum}: Invalid branch name "${branchRaw}"`);
        return;
      }

      if (user.role === Role.HOD && normalizedBranch !== user.department) {
        errors.push(`Row ${rowNum}: Boundary Violation! You can only upload for ${user.department}`);
        return;
      }

      validatedStudents.push({
        id: Math.random().toString(36).substr(2, 9),
        name,
        rollNumber: reg.slice(-5),
        regNumber: reg,
        age: 18,
        branch: normalizedBranch,
        semester: 1,
        section: 'A',
        status: 'ACTIVE'
      });
    });

    if (errors.length > 0) {
      setUploadResults({ errors, successCount: 0 });
    } else {
      const updated = [...students, ...validatedStudents];
      setStudents(updated);
      db.saveStudents(updated);
      db.logActivity(user.name, `Bulk imported ${validatedStudents.length} students`);
      setUploadResults({ errors: [], successCount: validatedStudents.length });
      setBulkText('');
      setTimeout(() => {
        setBulkMode(false);
        setUploadResults(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Student Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Found {filtered.length} active records in current scope.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user.role !== Role.FACULTY && (
            <button 
              onClick={() => { setBulkMode(true); setUploadResults(null); }}
              className="flex items-center gap-3 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-[1.5rem] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              <FileUp size={22} /> Batch Ingest
            </button>
          )}
          <button 
            onClick={() => { setShowAddModal(true); setEditingStudent(null); setFormData({ branch: user.department || Branch.CS, semester: 1, section: 'A' }); }}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all scale-105"
          >
            <UserPlus size={22} /> New Enrollment
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text" 
            placeholder="Search student by Name, Register ID, or Roll Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 font-black transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-sm">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-lg leading-none">{s.name}</p>
                        <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 mt-2 tracking-widest uppercase">{s.regNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-full uppercase tracking-tighter max-w-[200px] truncate">{s.branch}</span>
                      <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-black rounded-full uppercase">SEM {s.semester}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => { setEditingStudent(s); setFormData(s); setShowAddModal(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => { if(confirm(`Delete ${s.name}?`)) { const up = students.filter(st => st.id !== s.id); setStudents(up); db.saveStudents(up); }}} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-500 font-black text-xl uppercase tracking-widest">No Matches</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Batch Import Modal */}
      {bulkMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Batch Enrollment</h3>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Authorized as {user.role}</p>
              </div>
              <button onClick={() => setBulkMode(false)} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"><X size={28} className="text-slate-500" /></button>
            </div>
            
            <div className="p-10 space-y-8">
              {!uploadResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Guide Column */}
                  <div className="space-y-6">
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                        <FileSpreadsheet size={24} />
                        <p className="text-xs font-black uppercase tracking-widest">Excel / CSV Format</p>
                      </div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                        Ensure your file contains exactly 3 columns in order:
                        <br/><span className="font-black text-indigo-800 dark:text-indigo-200 underline">Name, Register Number, Branch</span>
                      </p>
                      <code className="text-[10px] font-mono block leading-relaxed bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                        Raj Kumar, KPT24CS01, CS<br/>
                        Ananya S, KPT24EC05, Electronics
                      </code>
                    </div>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer p-8 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all text-center"
                    >
                      <UploadCloud size={48} className="mx-auto text-slate-300 group-hover:text-indigo-600 mb-4 transition-colors" />
                      <p className="text-sm font-black text-slate-900 dark:text-white">Upload .xlsx or .csv</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">Select file from system</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".csv, .xlsx" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  {/* Manual Column */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Or Paste Raw Data</label>
                    <textarea 
                      value={bulkText}
                      onChange={e => setBulkText(e.target.value)}
                      placeholder="Name, RegNum, Branch..."
                      className="w-full h-full min-h-[250px] p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {uploadResults && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500 text-center">
                  {uploadResults.errors.length > 0 ? (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-full flex items-center justify-center mx-auto animate-shake">
                        <XCircle size={40} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">Validation Error</h4>
                        <p className="text-slate-500 font-bold mt-2">Correct the following {uploadResults.errors.length} issues:</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2 text-left">
                        {uploadResults.errors.map((err, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase">
                            <AlertCircle size={14} /> {err}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setUploadResults(null)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg transition-all">Retry Import</button>
                    </div>
                  ) : (
                    <div className="py-12 space-y-6">
                      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 size={56} />
                      </div>
                      <div>
                        <h4 className="text-4xl font-black text-slate-900 dark:text-white">Successful</h4>
                        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest">{uploadResults.successCount} Students enrolled into database</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!uploadResults && (
                <button 
                  onClick={() => triggerProcessing(bulkText)} 
                  disabled={!bulkText.trim()}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none disabled:opacity-30 active:scale-95"
                >
                  Confirm Batch Processing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Modal already optimized in previous update */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{editingStudent ? 'Edit Records' : 'New Enrollment'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingStudent(null); }} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"><X size={28} className="text-slate-500" /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Full Legal Name</label>
                  <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Register ID</label>
                    <input type="text" value={formData.regNumber || ''} onChange={e => setFormData({...formData, regNumber: e.target.value})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Current SEM</label>
                    <select value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value) as Semester})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none appearance-none text-slate-900 dark:text-white">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Semester {n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Branch / Department</label>
                  <select disabled={user.role === Role.HOD} value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value as Branch})} className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-lg outline-none disabled:opacity-50 appearance-none text-slate-900 dark:text-white">
                    {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all mt-4 scale-[1.02]">
                {editingStudent ? 'Update Database' : 'Confirm Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
