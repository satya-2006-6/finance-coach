import React, { useState } from 'react';
import { SpendingLeak, Transaction, CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { SAMPLE_SMS_STRINGS } from '../data/initialData';
import { ShieldAlert, ShieldCheck, Sparkles, UploadCloud, MessageSquare, ArrowRight, CheckCircle2, AlertTriangle, FileText, Filter, Plus } from 'lucide-react';

interface SpendingLeaksViewProps {
  leaks: SpendingLeak[];
  transactions: Transaction[];
  currency: CurrencyCode;
  onAddTransactions: (newTxs: Transaction[]) => void;
  onPrescribeActionFromLeak: (leak: SpendingLeak) => void;
}

export const SpendingLeaksView: React.FC<SpendingLeaksViewProps> = ({
  leaks,
  transactions,
  currency,
  onAddTransactions,
  onPrescribeActionFromLeak,
}) => {
  const [parserMode, setParserMode] = useState<'sms' | 'csv'>('sms');
  const [rawText, setRawText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'leaks' | 'recurring'>('all');

  // Manual transaction add
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualAmount, setManualAmount] = useState<number>(1200);
  const [manualCategory, setManualCategory] = useState('Dining & Takeout');
  const [manualIsLeak, setManualIsLeak] = useState(false);

  const totalMonthlyBleed = leaks.reduce((sum, l) => sum + (l.monthlyBleed || 0), 0);

  const handleLoadSampleSMS = () => {
    setRawText(SAMPLE_SMS_STRINGS);
  };

  const handleParseWithGemini = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/coach/parse-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error(`Parsing failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
        const mapped: Transaction[] = data.transactions.map((t: any, idx: number) => ({
          id: `parsed-${Date.now()}-${idx}`,
          date: t.date || new Date().toISOString().split('T')[0],
          merchant: t.merchant || 'Parsed Merchant',
          amount: Number(t.amount) || 0,
          type: t.type === 'income' ? 'income' : 'expense',
          category: t.category || 'Other',
          isRecurring: !!t.isRecurring,
          isLeak: !!t.isLeak,
          leakReason: t.notes || (t.isLeak ? 'Potential spending friction' : undefined),
        }));

        onAddTransactions(mapped);
        setRawText('');
        triggerCelebration();
      } else {
        setParseError('No clear transactions detected. Try pasting standard bank alert SMS or a CSV snippet.');
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Failed to connect to parser service.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMerchant.trim() || manualAmount <= 0) return;

    const newTx: Transaction = {
      id: `manual-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      merchant: manualMerchant.trim(),
      amount: Number(manualAmount),
      type: 'expense',
      category: manualCategory,
      isLeak: manualIsLeak,
      leakReason: manualIsLeak ? 'Manually flagged spending leak' : undefined,
    };

    onAddTransactions([newTx]);
    setManualMerchant('');
    setShowManualModal(false);
    triggerCelebration();
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterMode === 'leaks') return t.isLeak;
    if (filterMode === 'recurring') return t.isRecurring;
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Privacy & Zero-Credential Trust Assurance */}
      <div className="bg-emerald-900/10 border border-emerald-800/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-emerald-950 font-display">
              Trust & Security: Zero Bank Credentials Needed
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              We never ask for your NetBanking password, debit card pin, or Account Aggregator OTPs. 
              Upload statements or paste bank transaction SMS with zero credential risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
            100% Anonymized Processing
          </span>
        </div>
      </div>

      {/* Identified Spending Leaks Diagnosis */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Diagnosed Money Leaks</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
              Where Your Hard-Earned Money Is Leaking
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Monthly Bleed</span>
            <span className="text-xl font-bold text-rose-600 font-display">
              {formatCurrency(totalMonthlyBleed, currency)}/mo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {leaks.map((leak) => (
            <div
              key={leak.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">{leak.category}</span>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                    -{formatCurrency(leak.monthlyBleed, currency)}/mo
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-display">
                  {leak.title}
                </h3>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Frequency: {leak.frequency}
                </span>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {leak.plainLanguageDiagnosis}
                </p>

                {/* Prescribed Action */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prescribed Move:</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {leak.prescribedAction}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                    🎯 Goal Impact: {leak.goalImpact}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onPrescribeActionFromLeak(leak)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Add Move to This Week’s Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statement & SMS Parser Tool */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <span>Connect Spending Data: Bank SMS & Statement Parser</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste transaction SMS texts or bank statement CSV lines. Gemini extracts structured data, identifies leaks, and updates your goals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSampleSMS}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Load Sample Indian Bank SMS
            </button>
          </div>
        </div>

        {/* Textarea Input */}
        <div>
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your bank alert SMS or statement text here (e.g. 'Sent Rs 1,420 via UPI to Swiggy on 08-Nov... Debit of Rs 12,000 for Loan EMI...')"
            className="w-full p-3.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
          />
        </div>

        {parseError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">
            {rawText.length > 0 ? `${rawText.split('\n').filter(Boolean).length} lines entered` : 'Ready to parse'}
          </span>

          <button
            onClick={handleParseWithGemini}
            disabled={isParsing || !rawText.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isParsing ? 'Parsing with Gemini AI...' : 'Parse Transactions & Detect Leaks'}</span>
          </button>
        </div>
      </div>

      {/* Transactions Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Recorded Spending Activity ({transactions.length} records)
            </h3>
            <p className="text-xs text-slate-500">
              Transactions analyzed for repetitive leaks, subscriptions, and surges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter segmented buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('leaks')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'leaks' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Leaks Only
              </button>
              <button
                onClick={() => setFilterMode('recurring')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterMode === 'recurring' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recurring / Subscriptions
              </button>
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual</span>
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.type === 'income'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tx.isLeak
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tx.merchant.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{tx.merchant}</span>
                    {tx.isLeak && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md">
                        Leak: {tx.leakReason || 'Discretionary'}
                      </span>
                    )}
                    {tx.isRecurring && (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {tx.date} · {tx.category}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm font-bold font-mono-numbers text-right ${
                  tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount, currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Transaction Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Add Expense or Spending Leak
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Log an unbudgeted impulse or regular expense.
            </p>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merchant / Payee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Gourmet, Zara, Uber"
                  value={manualMerchant}
                  onChange={(e) => setManualMerchant(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Dining & Takeout">Dining & Takeout</option>
                  <option value="Groceries & Delivery">Groceries & Quick Commerce</option>
                  <option value="Shopping & Discretionary">Shopping & Discretionary</option>
                  <option value="Subscriptions & Software">Subscriptions & Software</option>
                  <option value="Travel & Commute">Travel & Commute</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="flagLeak"
                  checked={manualIsLeak}
                  onChange={(e) => setManualIsLeak(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm"
                />
                <label htmlFor="flagLeak" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Flag as unnecessary spending leak
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
