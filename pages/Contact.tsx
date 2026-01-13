import React from 'react';
import { Phone, Mail, MapPin, Globe, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  const contactInfo = [
    { icon: <Phone size={20} />, label: 'Main Office', value: '+91 824 2211636' },
    { icon: <Mail size={20} />, label: 'Administration', value: 'office@kptmangalore.in' },
    { icon: <Globe size={20} />, label: 'Website', value: 'www.kptmangalore.in' },
    { icon: <MapPin size={20} />, label: 'Location', value: 'Kadri Hills, Mangalore, KA' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">Institutional Helpdesk</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Reach out to us for technical support or academic inquiries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-8 transition-colors">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-indigo-600 dark:text-indigo-400" /> Send a Message
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="john@example.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Message Detail</label>
                <textarea 
                  rows={4} 
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  placeholder="How can we help you today?"
                ></textarea>
              </div>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98]">
                Send Inquiry
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((info, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl inline-block mb-3">
                  {info.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{info.label}</p>
                <p className="font-black text-slate-900 dark:text-white mt-1.5 truncate">{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;