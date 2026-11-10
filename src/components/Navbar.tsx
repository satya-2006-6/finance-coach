import React from 'react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';
import { Sparkles, Target, Zap, ShieldAlert, MessageSquare, HandCoins, ShieldCheck, Pencil } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onOpenGoalSetup: () => void;
  onOpenSubscriptionModal: () => void;
  isProUser: boolean;
  activeActionsCount: number;
  appName?: string;
  onOpenRenameModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currency,
  onSelectCurrency,
  onOpenGoalSetup,
  onOpenSubscriptionModal,
  isProUser,
  activeActionsCount,
  appName = 'Kuber AI',
  onOpenRenameModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <span className="font-display font-bold text-lg text-emerald-400">₹</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenRenameModal}
                  className="group flex items-center gap-1.5 text-left cursor-pointer"
                  title="Click to rename app & coach"
                >
                  <span className="font-display font-bold text-lg text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {appName}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Action Coach
                </span>
                {isProUser ? (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    PRO
                  </span>
                ) : (
                  <button
                    onClick={onOpenSubscriptionModal}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Beyond boring charts · Prescribing exact financial moves
              </p>
            </div>
          </div>

          {/* Right Controls: Currency, Re-run Setup, Pro */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                title="Select Currency"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Re-run Goals Setup */}
            <button
              onClick={onOpenGoalSetup}
              className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Reconfigure Goals</span>
              <span className="sm:hidden">Goals</span>
            </button>

            {/* Pro Upgrade / Badge */}
            <button
              onClick={onOpenSubscriptionModal}
              className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isProUser
                  ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-200/80 border border-amber-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isProUser ? 'Coach Pro Active' : 'Get Coach Pro'}</span>
              <span className="sm:hidden">Pro</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation (Hidden on mobile) */}
        <nav className="hidden sm:flex space-x-1 sm:space-x-4 border-t border-slate-100 py-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectTab('actions')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'actions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Weekly Prescriptions</span>
            {activeActionsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  currentTab === 'actions' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {activeActionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'goals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Goals & Timeline Rings</span>
          </button>

          <button
            onClick={() => onSelectTab('leaks')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'leaks'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Spending Leaks & Parser</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'chat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Talk to Coach</span>
          </button>

          <button
            onClick={() => onSelectTab('negotiator')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'negotiator'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HandCoins className="w-4 h-4 text-amber-500" />
            <span>Bill Negotiator</span>
          </button>

          <button
            onClick={() => onSelectTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Privacy Vault</span>
          </button>
        </nav>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Bar (Visible only on mobile <= 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around safe-area-inset-bottom shadow-lg">
        <button
          onClick={() => onSelectTab('actions')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'actions' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Zap className={`w-5 h-5 ${currentTab === 'actions' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
            {activeActionsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {activeActionsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Actions</span>
        </button>

        <button
          onClick={() => onSelectTab('goals')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'goals' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className={`w-5 h-5 ${currentTab === 'goals' ? 'text-indigo-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Goals</span>
        </button>

        <button
          onClick={() => onSelectTab('leaks')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'leaks' ? 'text-rose-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 ${currentTab === 'leaks' ? 'text-rose-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Leaks</span>
        </button>

        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'chat' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${currentTab === 'chat' ? 'text-emerald-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Coach</span>
        </button>

        <button
          onClick={() => onSelectTab('negotiator')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentTab === 'negotiator' ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HandCoins className={`w-5 h-5 ${currentTab === 'negotiator' ? 'text-amber-600 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Negotiate</span>
        </button>
      </nav>
    </header>
  );
};
