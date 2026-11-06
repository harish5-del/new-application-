import React from 'react';
import { Menu, Search, Wifi, WifiOff } from 'lucide-react';
import { LanguageMode } from '../types';
import { useOnlineStatus } from '../hooks/usePWA';

interface HeaderProps {
  currentLanguage: LanguageMode;
  onToggleLanguage: (lang: LanguageMode) => void;
  onOpenMenu: () => void;
  onFocusSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onToggleLanguage,
  onOpenMenu,
  onFocusSearch,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name matching reference screenshot */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black">
            <span className="text-sm font-extrabold tracking-tighter">TT</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" title="Active Library" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-blue-900 tracking-tight font-serif">தமிழ்</span>
              <span className="text-[11px] font-extrabold text-blue-600 tracking-widest uppercase">TEST</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium -mt-1 hidden sm:block">Smart Current Affairs Library</span>
          </div>
        </div>

        {/* Right Action Icons: Search, Language Switcher, Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}
            title={isOnline ? 'Online - AI extraction available' : 'Offline Mode - Local data accessible'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Search Quick Button */}
          <button
            onClick={onFocusSearch}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            aria-label="Search current affairs"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Bilingual Switcher Capsule matching reference screenshot */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200">
            <button
              onClick={() => onToggleLanguage('ta')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                currentLanguage === 'ta'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                currentLanguage === 'en'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenMenu}
            className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
