
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 transition-all hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-700 overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className={`transition-all duration-500 transform ${darkMode ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <Moon size={22} strokeWidth={2.5} />
      </div>
      <div className={`absolute transition-all duration-500 transform ${darkMode ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <Sun size={22} strokeWidth={2.5} />
      </div>
    </button>
  );
};

export default ThemeToggle;
