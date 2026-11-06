import React from 'react';
import {
  X,
  Home,
  BookOpen,
  FileUp,
  Globe,
  HelpCircle,
  Newspaper,
  Tag,
  Bookmark,
  TrendingUp,
  Settings,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ActiveTab, LanguageMode } from '../types';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWA';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: LanguageMode;
  counts: {
    totalQuestions: number;
    totalArticles: number;
    bookmarked: number;
    studied: number;
  };
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  language,
  counts,
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: language === 'ta' ? 'முகப்பு / செய்திகள்' : 'Home / Daily Feed',
      icon: Home,
      badge: counts.totalArticles + counts.totalQuestions,
    },
    {
      id: 'topics' as ActiveTab,
      label: language === 'ta' ? 'தலைப்புகள் (Topics)' : 'Topics & Syllabus',
      icon: BookOpen,
      badge: '22',
    },
    {
      id: 'import_pdf' as ActiveTab,
      label: language === 'ta' ? 'PDF பதிவேற்றம் (AI)' : 'Import PDF (AI)',
      icon: FileUp,
      highlight: true,
    },
    {
      id: 'import_url' as ActiveTab,
      label: language === 'ta' ? 'இணையதள செய்தி (URL)' : 'Import Website News',
      icon: Globe,
    },
    {
      id: 'questions' as ActiveTab,
      label: language === 'ta' ? 'வினா வங்கி & பயிற்சி' : 'All Questions Bank',
      icon: HelpCircle,
      badge: counts.totalQuestions,
    },
    {
      id: 'news' as ActiveTab,
      label: language === 'ta' ? 'அனைத்து செய்திகள்' : 'All News Stories',
      icon: Newspaper,
      badge: counts.totalArticles,
    },
    {
      id: 'keywords' as ActiveTab,
      label: language === 'ta' ? 'முக்கிய சொற்கள் (Tags)' : 'Keywords Library',
      icon: Tag,
    },
    {
      id: 'bookmarks' as ActiveTab,
      label: language === 'ta' ? 'சேமிக்கப்பட்டவை' : 'Bookmarks',
      icon: Bookmark,
      badge: counts.bookmarked,
    },
    {
      id: 'progress' as ActiveTab,
      label: language === 'ta' ? 'படிப்பு முன்னேற்றம்' : 'Progress Tracker',
      icon: TrendingUp,
    },
    {
      id: 'settings' as ActiveTab,
      label: language === 'ta' ? 'காப்பு & அமைப்புகள்' : 'Backup & Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              TT
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Smart Current Affairs</h2>
              <p className="text-[11px] text-gray-500">Personal AI Study Library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Install Status Card */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-gray-700">App Status:</span>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Wifi className="w-3.5 h-3.5" /> Online (AI Ready)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <WifiOff className="w-3.5 h-3.5" /> Offline Storage
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            {isOnline
              ? 'PDF & URL extractions work via Gemini AI.'
              : 'Previously saved questions and news are 100% accessible offline.'}
          </p>

          {isInstallable && (
            <button
              onClick={install}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              {language === 'ta' ? 'செயலியை நிறுவு (Install PWA)' : 'Install App to Device'}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-gray-100 text-center text-[11px] text-gray-400 bg-gray-50/50">
          <span>Smart Current Affairs Organizer v1.0</span>
        </div>
      </div>
    </div>
  );
};
