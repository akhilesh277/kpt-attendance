import React from 'react';
import { Book, FileText, Download, Library } from 'lucide-react';

const Resources: React.FC = () => {
  const academicResources = [
    { title: 'Syllabus 2024-25', type: 'PDF', size: '2.4 MB', category: 'General' },
    { title: 'Academic Calendar', type: 'PDF', size: '1.1 MB', category: 'General' },
    { title: 'Lab Manuals - CS Dept', type: 'ZIP', size: '15.8 MB', category: 'CS' },
    { title: 'Automobile Workshop Guide', type: 'PDF', size: '4.2 MB', category: 'Auto' },
    { title: 'Scholarship Guidelines', type: 'DOCX', size: '850 KB', category: 'Admin' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-4 mb-2">
          <Library className="text-indigo-600 dark:text-indigo-400" size={32} />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Academic Resources</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Download official KPT Mangalore academic documents and department materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicResources.map((res, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                {res.type === 'PDF' ? <FileText size={24} /> : <Book size={24} />}
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{res.category}</span>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{res.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">{res.type} • {res.size}</p>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-all font-bold text-sm">
              <Download size={16} /> Download File
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;