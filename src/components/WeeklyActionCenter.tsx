import React, { useState } from 'react';
import { WeeklyAction, FinancialGoal, CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { Zap, CheckCircle2, Clock, ArrowRight, ShieldCheck, RefreshCw, Sparkles, AlertCircle, Plus } from 'lucide-react';

interface WeeklyActionCenterProps {
  actions: WeeklyAction[];
  goals: FinancialGoal[];
  currency: CurrencyCode;
  onCompleteAction: (actionId: string) => void;
  onAddCustomAction: (action: Omit<WeeklyAction, 'id' | 'isCompleted'>) => void;
  onRefreshFromCoach: () => void;
  isLoadingCoach: boolean;
  onOpenGoalSetup: () => void;
  coachName?: string;
}

export const WeeklyActionCenter: React.FC<WeeklyActionCenterProps> = ({
  actions,
  goals,
  currency,
  onCompleteAction,
  onAddCustomAction,
  onRefreshFromCoach,
  isLoadingCoach,
  onOpenGoalSetup,
  coachName = 'Coach Kuber',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number>(3000);
  const [newDeadline, setNewDeadline] = useState('This Sunday');
  const [newReason, setNewReason] = useState('');
  const [targetGoalId, setTargetGoalId] = useState(goals[0]?.id || '');

  const pendingActions = actions.filter((a) => !a.isCompleted);
  const completedActions = actions.filter((a) => a.isCompleted);

  const totalActionSavings = actions.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalCompletedSavings = completedActions.reduce((sum, a) => sum + (a.amount || 0), 0);

  const handleExecute = (actionId: string) => {
    onCompleteAction(actionId);
    triggerCelebration();
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCustomAction({
      title: newTitle.trim(),
      actionType: 'transfer_savings',
      amount: Number(newAmount),
      targetGoalId: targetGoalId || undefined,
      deadline: newDeadline,
      reason: newReason.trim() || 'Custom financial action to accelerate savings goal.',
      impactDescription: `Redirects ${formatCurrency(newAmount, currency)} into your chosen goal.`,
    });

    setNewTitle('');
    setNewReason('');
    setShowAddModal(false);
    triggerCelebration();
  };

  return (
    <div className="space-y-6">
      
      {/* Coach Prescription Briefing Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 fill-emerald-400" />
              <span>{coachName} · This Week's Action Directive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Do not look at another chart. Execute these 3 moves.
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Most personal finance apps leave you feeling anxious after showing red graphs. 
              Here is your concrete plan: <strong>move {formatCurrency(5000, currency)} to your emergency fund this Friday</strong>{' '}
              and cap weekend dining. Complete each move with one tap.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 min-w-[200px]">
            <p className="text-xs text-slate-300 font-medium">Cash Unlocked This Week</p>
            <p className="text-2xl font-bold font-display text-emerald-300 mt-0.5">
              {formatCurrency(totalCompletedSavings, currency)}
            </p>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{completedActions.length} of {actions.length} completed</span>
              <span className="font-semibold text-white">
                {actions.length > 0 ? Math.round((completedActions.length / actions.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${actions.length > 0 ? (completedActions.length / actions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls toolbar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>High-impact behavioral momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshFromCoach}
              disabled={isLoadingCoach}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCoach ? 'animate-spin' : ''}`} />
              <span>{isLoadingCoach ? 'Consulting Gemini...' : 'Re-analyze Spending with Coach'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Prescriptions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <span>Pending Actions</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md">
              {pendingActions.length} Pending
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Total Potential Impact: {formatCurrency(totalActionSavings - totalCompletedSavings, currency)}
          </span>
        </div>

        {pendingActions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">All Prescriptions Cleared for This Week!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              You executed every prescribed move. Your emergency fund and loan balances reflect your discipline.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={onRefreshFromCoach}
                className="text-xs px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Scan Next Week’s Leaks
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingActions.map((action, idx) => {
              const targetGoal = goals.find((g) => g.id === action.targetGoalId);
              return (
                <div
                  key={action.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Move #{idx + 1}
                      </span>
                      {action.targetGoalId && targetGoal && (
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          Goal: {targetGoal.title}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {action.deadline}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {action.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {action.reason}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded-sm">
                        ⚡ Impact: {action.impactDescription}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Value: {formatCurrency(action.amount, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400">Target Shift</p>
                      <p className="text-lg font-bold text-slate-900 font-display">
                        {formatCurrency(action.amount, currency)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecute(action.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Execute & Log Move</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Actions Archive */}
      {completedActions.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>Executed Actions This Cycle</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              {completedActions.length} Completed
            </span>
          </h3>

          <div className="space-y-2">
            {completedActions.map((action) => (
              <div
                key={action.id}
                className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 line-through mr-2">
                      {action.title}
                    </span>
                    <span className="text-slate-500">{action.impactDescription}</span>
                  </div>
                </div>
                <div className="font-bold text-emerald-700 font-mono-numbers">
                  +{formatCurrency(action.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
              Create a Specific Financial Action
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Phrase it as a direct command (e.g. "Move ₹4,000 to Liquid Fund" or "Sell old electronics on OLX").
            </p>

            <form onSubmit={handleCreateAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Directive
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Move ₹3,500 to Emergency Fund"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Friday 5 PM"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tie to Active Goal
                </label>
                <select
                  value={targetGoalId}
                  onChange={(e) => setTargetGoalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">No specific goal (General Surplus)</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why this move matters
                </label>
                <input
                  type="text"
                  placeholder="e.g. Canceling unneeded add-on before month-end"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
