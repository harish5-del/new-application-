import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Info,
  RefreshCw
} from 'lucide-react';
import { exportAllData, importAllData, clearAllData } from '../db/indexedDB';
import { LanguageMode } from '../types';
import { usePWAInstall } from '../hooks/usePWA';

interface SettingsScreenProps {
  language: LanguageMode;
  totalQuestions: number;
  totalArticles: number;
  onRefreshData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  totalQuestions,
  totalArticles,
  onRefreshData,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Export full JSON backup
  const handleExport = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const jsonStr = await exportAllData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `Smart_Current_Affairs_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Backup successfully exported! Keep this JSON file safe for offline restore on any device.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Export failed: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  // Restore JSON backup
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const res = await importAllData(text);
      onRefreshData();
      setStatusMessage({
        type: 'success',
        text: `Restored ${res.questionsAdded} questions and ${res.articlesAdded} articles from backup!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Import failed: ${err.message}. Make sure the file is a valid Smart Current Affairs JSON backup.` });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // Clear data
  const handleClear = async () => {
    try {
      await clearAllData();
      setShowClearConfirm(false);
      onRefreshData();
      setStatusMessage({ type: 'success', text: 'All local database records cleared successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Clear failed: ${err.message}` });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          {language === 'ta' ? 'காப்புப் பிரதி & அமைப்புகள்' : 'Data Backup & Storage Settings'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'ta'
            ? 'உங்கள் சேமிக்கப்பட்ட தரவுகளை பாதுகாப்பாக பதிவிறக்கவும் அல்லது மீட்டமைக்கவும்.'
            : 'Export your entire library as a portable JSON backup or restore on any smartphone or tablet.'}
        </p>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl mb-5 flex items-start gap-3 border text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="font-semibold">{statusMessage.text}</p>
        </div>
      )}

      {/* Storage & Database Stats */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs mb-5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Local IndexedDB Status</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 block text-[11px]">Saved Questions:</span>
            <span className="text-lg font-bold text-gray-900">{totalQuestions}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 block text-[11px]">Saved Articles:</span>
            <span className="text-lg font-bold text-gray-900">{totalArticles}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-500">
          Storage engine: Browser IndexedDB (Local-First). Data persists across page reloads, browser restarts, and offline usage.
        </p>
      </div>

      {/* JSON Backup & Restore Actions */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-4 mb-5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
          Backup & Restore (JSON)
        </h3>

        {/* Export Button */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-150">
          <div>
            <h4 className="text-xs font-bold text-gray-900">Export Library Backup</h4>
            <p className="text-[11px] text-gray-500">Download complete questions, articles, and notes as a .json file</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Import File Button */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-150">
          <div>
            <h4 className="text-xs font-bold text-gray-900">Restore Library Backup</h4>
            <p className="text-[11px] text-gray-500">Upload a previously exported .json file to restore</p>
          </div>
          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Restoring...' : 'Restore JSON'}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* PWA App Installation Info */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs mb-5">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Progressive Web App (PWA) Status</span>
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          {isInstalled
            ? 'App is currently running in standalone installed mode on your device.'
            : 'Install this application to your Android phone, iPad, or laptop home screen for 1-tap offline access.'}
        </p>

        {isInstallable && (
          <button
            onClick={install}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 shadow-xs transition"
          >
            Install App to Home Screen
          </button>
        )}
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/40">
        <h3 className="text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Reset Database</span>
        </h3>
        <p className="text-[11px] text-rose-700 mb-3">
          Permanently delete all questions and articles stored in your browser&apos;s IndexedDB. (Make sure to export a backup first!)
        </p>

        {showClearConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Yes, Delete All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-100 transition"
          >
            Clear Local Data
          </button>
        )}
      </div>
    </div>
  );
};
