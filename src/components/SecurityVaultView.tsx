import React, { useState } from 'react';
import { FinancialGoal, Transaction, UserProfile, CurrencyCode } from '../types';
import { ShieldCheck, Lock, Download, Trash2, EyeOff, KeyRound, ServerOff, CheckCircle } from 'lucide-react';

interface SecurityVaultViewProps {
  userProfile: UserProfile;
  goals: FinancialGoal[];
  transactions: Transaction[];
  currency: CurrencyCode;
  onResetAllData: () => void;
}

export const SecurityVaultView: React.FC<SecurityVaultViewProps> = ({
  userProfile,
  goals,
  transactions,
  currency,
  onResetAllData,
}) => {
  const [anonymizeBeforeAI, setAnonymizeBeforeAI] = useState<boolean>(true);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleExportData = () => {
    const backupData = {
      userProfile,
      goals,
      transactions,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nivesh-financial-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Security Architecture Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Trust & Privacy Constitution
            </h1>
            <p className="text-xs text-slate-500">
              Why Nivesh AI is architected differently from high-risk banking scrapers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Zero Bank Credentials</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never prompt for your NetBanking password, debit card CVV, or banking OTP. 
              No credential leakage can ever occur because we never ask for them.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <ServerOff className="w-4 h-4 text-indigo-600" />
              <span>Client-First Data Vault</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your financial aspirations, target numbers, and parsed transactions reside in your local browser storage,
              never sold to credit bureaus or loan marketers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <EyeOff className="w-4 h-4 text-blue-600" />
              <span>Zero-Retention AI Analysis</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When Gemini analyzes your spending leaks or generates negotiation scripts, it is processed ephemerally
              without training model datasets on your personal records.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Settings & Toggles */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-display">
          Privacy Safeguards
        </h2>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-xs sm:text-sm text-slate-800">
                Anonymize Personal Identifiers in AI Prompts
              </p>
              <p className="text-xs text-slate-500">
                Automatically masks phone numbers, account suffixes (XX4921), and full names before processing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnonymizeBeforeAI(!anonymizeBeforeAI)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                anonymizeBeforeAI ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management: Export & Reset */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-display">
          Your Data, Your Ownership
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="font-bold text-xs sm:text-sm text-slate-900">
              Export Complete Financial Snapshot
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Download your active goals, spending leaks, and transaction logs in standard JSON format.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {downloadSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'Downloaded!' : 'Export JSON Backup'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 border border-rose-200">
          <div>
            <p className="font-bold text-xs sm:text-sm text-rose-950">
              Purge All Data & Reset Application
            </p>
            <p className="text-xs text-rose-800 mt-0.5">
              Instantly wipes all transactions, goals, and history from local storage.
            </p>
          </div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Local Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Confirm Data Purge?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This will reset all goals and transactions back to the clean seed state. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Yes, Purge Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
