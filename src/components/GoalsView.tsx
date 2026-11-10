import React, { useState } from 'react';
import { FinancialGoal, CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { Target, TrendingUp, Shield, GraduationCap, Car, Sparkles, Plus, Calendar, Clock, Sliders, ArrowUpRight } from 'lucide-react';

interface GoalsViewProps {
  goals: FinancialGoal[];
  currency: CurrencyCode;
  onUpdateGoalAmount: (goalId: string, addedAmount: number) => void;
  onOpenGoalSetup: () => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
}

interface CircularProgressProps {
  amountPercent: number;
  timelinePercent: number;
  currency: CurrencyCode;
  currentAmount: number;
  targetAmount: number;
  elapsedMonths: number;
  totalMonths: number;
  deadlineDate: string;
}

const CircularGoalRing: React.FC<CircularProgressProps> = ({
  amountPercent,
  timelinePercent,
  currency,
  currentAmount,
  targetAmount,
  elapsedMonths,
  totalMonths,
  deadlineDate,
}) => {
  // SVG concentric circles math
  // Outer circle: Target Amount (Radius = 54, Circumference = 2 * PI * 54 = 339.29)
  const outerRadius = 54;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference - (outerCircumference * Math.min(100, Math.max(0, amountPercent))) / 100;

  // Inner circle: Timeline (Radius = 42, Circumference = 2 * PI * 42 = 263.89)
  const innerRadius = 42;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference - (innerCircumference * Math.min(100, Math.max(0, timelinePercent))) / 100;

  const paceDelta = amountPercent - timelinePercent;
  const isAhead = paceDelta >= 0;

  return (
    <div className="flex flex-col items-center pt-2">
      {/* Concentric Circular Rings Graphic */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
          {/* Background track for Outer Ring (Amount) */}
          <circle
            cx="65"
            cy="65"
            r={outerRadius}
            stroke="#f1f5f9"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Outer Ring: Target Amount Funded */}
          <circle
            cx="65"
            cy="65"
            r={outerRadius}
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerOffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Background track for Inner Ring (Timeline) */}
          <circle
            cx="65"
            cy="65"
            r={innerRadius}
            stroke="#f8fafc"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Inner Ring: Timeline Elapsed */}
          <circle
            cx="65"
            cy="65"
            r={innerRadius}
            stroke="#6366f1"
            strokeWidth="6"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 font-display tracking-tight">
            {amountPercent}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Funded
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
              isAhead
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-800'
            }`}
          >
            {isAhead ? 'Ahead of Pace' : 'Behind Pace'}
          </span>
        </div>
      </div>

      {/* Dual Comparative Legend */}
      <div className="w-full mt-3 grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        {/* Outer Ring Legend: Amount */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Amount Funded</span>
          </div>
          <p className="font-bold text-slate-900 text-xs">
            {formatCurrency(currentAmount, currency)}
          </p>
          <p className="text-[10px] text-slate-400">
            of {formatCurrency(targetAmount, currency)}
          </p>
        </div>

        {/* Inner Ring Legend: Timeline */}
        <div className="space-y-0.5 border-l border-slate-200 pl-2.5">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <span>Timeline Elapsed</span>
          </div>
          <p className="font-bold text-slate-900 text-xs">
            {timelinePercent}% Time
          </p>
          <p className="text-[10px] text-slate-400">
            {elapsedMonths}/{totalMonths} mos ({deadlineDate})
          </p>
        </div>
      </div>
    </div>
  );
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  currency,
  onUpdateGoalAmount,
  onOpenGoalSetup,
  onOpenCoachWithPrompt,
}) => {
  // What-If Simulator state
  const [diningCutPercent, setDiningCutPercent] = useState<number>(35); // 35% cut in takeout
  const [cancelSubs, setCancelSubs] = useState<boolean>(true); // cancel gym/duplicate OTT
  const [weekendCapAmount, setWeekendCapAmount] = useState<number>(3000); // monthly savings from weekend cap

  // Base leak savings calculation
  const baselineDiningSpend = 13800;
  const diningSavings = Math.round((baselineDiningSpend * diningCutPercent) / 100);
  const subSavings = cancelSubs ? 2890 : 0;
  const totalSimulatedMonthlyRecovery = diningSavings + subSavings + weekendCapAmount;

  const [depositModalGoalId, setDepositModalGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(5000);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoalId || depositAmount <= 0) return;
    onUpdateGoalAmount(depositModalGoalId, Number(depositAmount));
    setDepositModalGoalId(null);
    triggerCelebration();
  };

  const getCategoryIcon = (category: FinancialGoal['category']) => {
    switch (category) {
      case 'emergency_fund':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'debt_payoff':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'vehicle':
        return <Car className="w-5 h-5 text-blue-600" />;
      default:
        return <Target className="w-5 h-5 text-slate-700" />;
    }
  };

  // Helper to compute timeline elapsed metrics
  const getTimelineMetrics = (goal: FinancialGoal) => {
    const totalMonths = Math.max(1, goal.targetMonths || 12);
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    // Calculate months remaining till deadlineDate or based on pace
    let monthsRemaining = goal.monthlyRequired > 0 ? Math.ceil(remaining / goal.monthlyRequired) : totalMonths;
    if (goal.deadlineDate) {
      const [year, month] = goal.deadlineDate.split('-').map(Number);
      if (year && month) {
        const now = new Date();
        const diffMonths = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
        if (diffMonths >= 0) {
          monthsRemaining = Math.max(1, diffMonths);
        }
      }
    }
    const elapsedMonths = Math.max(1, Math.min(totalMonths, totalMonths - monthsRemaining));
    const timelinePercent = Math.min(100, Math.max(15, Math.round((elapsedMonths / totalMonths) * 100)));
    return { elapsedMonths, totalMonths, timelinePercent };
  };

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Target Quantifications & Timeline Pace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-0.5">
            Your Active Financial Aspirations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Concentric progress rings compare capital saved (outer green ring) against timeline elapsed (inner indigo ring).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGoalSetup}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Edit Goals</span>
          </button>
        </div>
      </div>

      {/* Visual Guide Banner for Circular Rings */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-800">Circular Rings Guide:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <strong className="text-slate-800">Outer Ring</strong>: % Target Amount Saved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <strong className="text-slate-800">Inner Ring</strong>: % Timeline Elapsed
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Ideal pace: Outer green ring leads or matches inner purple ring.
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const amountPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const { elapsedMonths, totalMonths, timelinePercent } = getTimelineMetrics(goal);

          // Compute accelerated months with simulator
          const allocatedExtraPerGoal = totalSimulatedMonthlyRecovery / Math.max(1, goals.length);
          const normalMonths = goal.monthlyRequired > 0 ? Math.ceil(remaining / goal.monthlyRequired) : 0;
          const acceleratedMonthly = goal.monthlyRequired + allocatedExtraPerGoal;
          const acceleratedMonths = acceleratedMonthly > 0 ? Math.ceil(remaining / acceleratedMonthly) : 0;
          const monthsSaved = Math.max(0, normalMonths - acceleratedMonths);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {goal.type === 'short_term' ? 'Short-Term' : 'Long-Term'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 font-display">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{goal.notes}</p>

                {/* Circular Progress Rings Graphic */}
                <CircularGoalRing
                  amountPercent={amountPercent}
                  timelinePercent={timelinePercent}
                  currency={currency}
                  currentAmount={goal.currentAmount}
                  targetAmount={goal.targetAmount}
                  elapsedMonths={elapsedMonths}
                  totalMonths={totalMonths}
                  deadlineDate={goal.deadlineDate}
                />

                {/* Metrics detail */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Required Pace</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(goal.monthlyRequired, currency)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Remaining Gap</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(remaining, currency)}
                    </span>
                  </div>
                </div>

                {/* Simulation Impact Ribbon */}
                {monthsSaved > 0 && (
                  <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Plugging leaks hits this {monthsSaved} month{monthsSaved > 1 ? 's' : ''} earlier!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpenCoachWithPrompt(
                      `How can I optimize my spending to reach my "${goal.title}" goal (target ${formatCurrency(
                        goal.targetAmount,
                        currency
                      )}) faster than ${goal.targetMonths} months?`
                    )
                  }
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Coach Tips</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositModalGoalId(goal.id);
                    setDepositAmount(5000);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Add Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Spending Impact Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              <span>Interactive Spending Pattern & Goal Impact Engine</span>
            </div>
            <h2 className="text-xl font-bold font-display">
              "What happens if I plug my leaks?"
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust how much discretionary friction you want to eliminate and watch your target goal dates pull forward in real-time.
            </p>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3 text-right">
            <span className="text-[11px] text-emerald-300 font-medium block">Total Recovered Cash</span>
            <span className="text-2xl font-bold font-display text-emerald-400">
              +{formatCurrency(totalSimulatedMonthlyRecovery, currency)}
              <span className="text-xs font-normal text-emerald-200">/mo</span>
            </span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          {/* Slider 1: Food Delivery */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Cut Food Delivery by</span>
              <span className="font-bold text-emerald-400">{diningCutPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={diningCutPercent}
              onChange={(e) => setDiningCutPercent(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Saves {formatCurrency(diningSavings, currency)}/mo</span>
              <span>Cook ~{Math.ceil(diningCutPercent / 15)} more meals</span>
            </div>
          </div>

          {/* Toggle 2: Ghost Subscriptions */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Cancel Inactive Subscriptions</span>
              <button
                type="button"
                onClick={() => setCancelSubs(!cancelSubs)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  cancelSubs ? 'bg-emerald-500 justify-end' : 'bg-slate-600 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Pauses unused gym membership & duplicate Netflix Ultra HD streaming.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold pt-1">
              {cancelSubs ? `+${formatCurrency(2890, currency)}/mo freed` : '0/mo savings'}
            </div>
          </div>

          {/* Slider 3: Weekend Cap */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">Weekend Impulse Cap</span>
              <span className="font-bold text-emerald-400">{formatCurrency(weekendCapAmount, currency)}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="6000"
              step="500"
              value={weekendCapAmount}
              onChange={(e) => setWeekendCapAmount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>48-hour shopping cart rule</span>
              <span>Prevents late-night carts</span>
            </div>
          </div>
        </div>

        {/* Concrete Outcome Summary */}
        <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            <strong className="text-white block font-semibold text-sm">
              The Coach's Bottom Line:
            </strong>
            <span>
              By diverting {formatCurrency(totalSimulatedMonthlyRecovery, currency)} into your emergency cushion and car down payment,
              you reach total financial resilience <strong className="text-emerald-300">4.2 months faster</strong> while preserving
              all weekend essentials.
            </span>
          </div>
          <button
            onClick={() =>
              onOpenCoachWithPrompt(
                `Coach, I simulated saving ${formatCurrency(
                  totalSimulatedMonthlyRecovery,
                  currency
                )}/mo by cutting takeout by ${diningCutPercent}% and canceling unused subscriptions. Give me a step-by-step 30-day playbook to enforce this.`
              )
            }
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg shrink-0 cursor-pointer"
          >
            Get Custom Playbook
          </button>
        </div>
      </div>

      {/* Manual Deposit Modal */}
      {depositModalGoalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Record Progress / Deposit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add savings transferred from your primary account.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Deposited ({currency})
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex gap-2">
                {[2000, 5000, 10000, 25000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset)}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    +{formatCurrency(preset, currency)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalGoalId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirm Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
