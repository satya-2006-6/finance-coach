import React from 'react';
import { CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { Sparkles, Check, X, ShieldCheck, Zap, HandCoins, ArrowRight } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  onTogglePro: (isPro: boolean) => void;
  currency: CurrencyCode;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isProUser,
  onTogglePro,
  currency,
}) => {
  if (!isOpen) return null;

  const proPrice = currency === 'INR' ? 499 : 9.99;
  const period = '/month';

  const handleActivatePro = () => {
    onTogglePro(true);
    triggerCelebration();
    onClose();
  };

  const handleRevertFree = () => {
    onTogglePro(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-3 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Nivesh Coach Pro · Unlock Peak Wealth Acceleration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            The Coach that pays for itself in the first 48 hours.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Most subscribers recover over 10x the monthly cost simply by executing one AI bill negotiation or plugging a recurring leak.
          </p>
        </div>

        {/* Tier Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Free Tier */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Basic Coach
              </span>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold text-slate-900 font-display">Free</span>
                <span className="text-xs text-slate-500"> forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 2 active financial goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Weekly top-3 spending leak diagnosis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manual transaction logging</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>AI Bill Negotiator scripts</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Unlimited multi-goal what-if simulator</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              {isProUser ? (
                <button
                  type="button"
                  onClick={handleRevertFree}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Downgrade to Free
                </button>
              ) : (
                <div className="text-center text-xs font-semibold text-slate-500 py-2">
                  Current Active Plan
                </div>
              )}
            </div>
          </div>

          {/* Pro Tier */}
          <div className="p-5 rounded-2xl border-2 border-emerald-600 bg-linear-to-b from-emerald-50/30 to-white flex flex-col justify-between relative shadow-sm">
            <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
              Recommended
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Coach Pro
              </span>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold text-slate-900 font-display">
                  {formatCurrency(proPrice, currency)}
                </span>
                <span className="text-xs text-slate-500">{period}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900">Unlimited Short & Long-term Goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900">AI Bill Negotiator with retention scripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deep Spending Pattern & What-If Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bank Statement & SMS Parser</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personalized weekly behavioral playbooks</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100">
              {isProUser ? (
                <div className="w-full py-2 bg-emerald-100 text-emerald-900 text-xs font-bold text-center rounded-xl">
                  ✓ Pro Membership Active
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleActivatePro}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Activate Pro (Instant Simulation)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Satisfaction Guarantee */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero risk · Cancel anytime in 1 tap · No lock-in</span>
        </div>

      </div>
    </div>
  );
};
