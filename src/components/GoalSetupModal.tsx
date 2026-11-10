import React, { useState } from 'react';
import { FinancialGoal, UserProfile, CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { Sparkles, Shield, GraduationCap, Car, Home, Plane, TrendingUp, Check, ArrowRight, ArrowLeft, AlertCircle, X, ChevronRight } from 'lucide-react';

interface GoalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentGoals: FinancialGoal[];
  onSaveGoalsAndProfile: (goals: FinancialGoal[], updatedProfile: Partial<UserProfile>) => void;
  currency: CurrencyCode;
}

interface DraftGoal {
  id: string;
  title: string;
  category: FinancialGoal['category'];
  type: 'short_term' | 'long_term';
  targetAmount: number;
  currentAmount: number;
  targetMonths: number;
  priority: 'high' | 'medium' | 'low';
  selected: boolean;
  notes: string;
}

const TEMPLATE_GOALS: DraftGoal[] = [
  {
    id: 'goal-emergency',
    title: '3-6 Month Emergency Fund',
    category: 'emergency_fund',
    type: 'short_term',
    targetAmount: 150000,
    currentAmount: 45000,
    targetMonths: 6,
    priority: 'high',
    selected: true,
    notes: 'Liquid safety cushion for job loss, medical emergencies, or car repairs.',
  },
  {
    id: 'goal-student-loan',
    title: 'Pay Off Student Loan / Debt',
    category: 'debt_payoff',
    type: 'short_term',
    targetAmount: 180000,
    currentAmount: 50000,
    targetMonths: 10,
    priority: 'high',
    selected: true,
    notes: 'Eliminating high-interest monthly EMI to free up cash flow.',
  },
  {
    id: 'goal-car',
    title: 'New Car Down Payment',
    category: 'vehicle',
    type: 'long_term',
    targetAmount: 350000,
    currentAmount: 60000,
    targetMonths: 16,
    priority: 'medium',
    selected: true,
    notes: 'Down payment for a reliable electric or hybrid vehicle.',
  },
  {
    id: 'goal-home',
    title: 'Home Down Payment',
    category: 'home',
    type: 'long_term',
    targetAmount: 1000000,
    currentAmount: 150000,
    targetMonths: 36,
    priority: 'medium',
    selected: false,
    notes: 'Initial equity down payment fund for first property purchase.',
  },
  {
    id: 'goal-vacation',
    title: 'Dream Travel & Rejuvenation',
    category: 'vacation',
    type: 'short_term',
    targetAmount: 75000,
    currentAmount: 15000,
    targetMonths: 6,
    priority: 'low',
    selected: false,
    notes: 'Guilt-free travel fund saved in advance without credit card debt.',
  },
  {
    id: 'goal-retirement',
    title: 'Long-term Wealth / FIRE Corpus',
    category: 'retirement',
    type: 'long_term',
    targetAmount: 2500000,
    currentAmount: 300000,
    targetMonths: 60,
    priority: 'medium',
    selected: false,
    notes: 'Index funds and equity SIP portfolio for financial independence.',
  },
];

export const GoalSetupModal: React.FC<GoalSetupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveGoalsAndProfile,
  currency,
}) => {
  const [step, setStep] = useState<number>(1);
  const [draftGoals, setDraftGoals] = useState<DraftGoal[]>(TEMPLATE_GOALS);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(userProfile.monthlyIncome);
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState<number>(userProfile.monthlyFixedCosts);
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalType, setCustomGoalType] = useState<'short_term' | 'long_term'>('short_term');

  if (!isOpen) return null;

  const toggleGoalSelection = (id: string) => {
    setDraftGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g))
    );
  };

  const updateGoalField = (id: string, field: keyof DraftGoal, value: any) => {
    setDraftGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleAddCustomGoal = () => {
    if (!customGoalTitle.trim()) return;
    const newGoal: DraftGoal = {
      id: `goal-custom-${Date.now()}`,
      title: customGoalTitle.trim(),
      category: 'custom',
      type: customGoalType,
      targetAmount: customGoalType === 'short_term' ? 50000 : 250000,
      currentAmount: 0,
      targetMonths: customGoalType === 'short_term' ? 6 : 24,
      priority: 'medium',
      selected: true,
      notes: 'Custom user goal.',
    };
    setDraftGoals((prev) => [...prev, newGoal]);
    setCustomGoalTitle('');
  };

  const selectedGoals = draftGoals.filter((g) => g.selected);

  // Calculations for step 3 & 4
  const totalMonthlySavingsRequired = selectedGoals.reduce((sum, g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    return sum + (g.targetMonths > 0 ? remaining / g.targetMonths : 0);
  }, 0);

  const baselineSurplus = monthlyIncome - monthlyFixedCosts;
  // Estimated leak based on typical discretionary pattern (~26% of baseline surplus)
  const estimatedLeaks = 25090; 
  const actualDiscretionaryCashflow = baselineSurplus - estimatedLeaks;
  const monthlyGap = totalMonthlySavingsRequired - actualDiscretionaryCashflow;

  const handleFinish = () => {
    const finalGoals: FinancialGoal[] = selectedGoals.map((dg) => {
      const remaining = Math.max(0, dg.targetAmount - dg.currentAmount);
      const monthlyReq = dg.targetMonths > 0 ? Math.ceil(remaining / dg.targetMonths) : 0;
      
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + dg.targetMonths);
      const deadlineStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      return {
        id: dg.id,
        title: dg.title,
        category: dg.category,
        type: dg.type,
        targetAmount: Number(dg.targetAmount),
        currentAmount: Number(dg.currentAmount),
        targetMonths: Number(dg.targetMonths),
        monthlyRequired: monthlyReq,
        deadlineDate: deadlineStr,
        priority: dg.priority,
        notes: dg.notes,
      };
    });

    onSaveGoalsAndProfile(finalGoals, {
      monthlyIncome,
      monthlyFixedCosts,
      onboardingCompleted: true,
    });
    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Header with Step Tracker */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{userProfile.coachName || 'Coach Kuber'} · Interactive Goal Setup</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">
              {step === 1 && 'Step 1: Choose Your Core Aspirations'}
              {step === 2 && 'Step 2: Quantify Target Amounts & Timelines'}
              {step === 3 && 'Step 3: Income & Fixed Cost Reality Check'}
              {step === 4 && 'Step 4: AI Coach Spending Pattern & Gap Analysis'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="h-1 bg-slate-100 w-full">
          <div
            className="h-1 bg-emerald-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-900 flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="font-semibold text-emerald-950">Why starting with goals changes everything:</p>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    Traditional budgeting fails because cutting expenses without an emotional prize feels like punishment. 
                    Select what you are actually striving toward—whether an emergency cushion, car down payment, or zero student debt.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Short-Term Aspirations (Under 12 Months)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draftGoals
                    .filter((g) => g.type === 'short_term')
                    .map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoalSelection(goal.id)}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                          goal.selected
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="pr-3">
                          <div className="flex items-center gap-2">
                            {goal.category === 'emergency_fund' && <Shield className="w-4 h-4 text-emerald-600" />}
                            {goal.category === 'debt_payoff' && <GraduationCap className="w-4 h-4 text-indigo-600" />}
                            {goal.category === 'vacation' && <Plane className="w-4 h-4 text-amber-600" />}
                            <span className="font-semibold text-sm text-slate-900">{goal.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{goal.notes}</p>
                          <div className="text-xs font-medium text-slate-600 mt-2">
                            Default: {formatCurrency(goal.targetAmount, currency)} in {goal.targetMonths} months
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 ${
                            goal.selected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {goal.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Long-Term Aspirations (Over 12 Months)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draftGoals
                    .filter((g) => g.type === 'long_term')
                    .map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoalSelection(goal.id)}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                          goal.selected
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="pr-3">
                          <div className="flex items-center gap-2">
                            {goal.category === 'vehicle' && <Car className="w-4 h-4 text-blue-600" />}
                            {goal.category === 'home' && <Home className="w-4 h-4 text-rose-600" />}
                            {goal.category === 'retirement' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                            <span className="font-semibold text-sm text-slate-900">{goal.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{goal.notes}</p>
                          <div className="text-xs font-medium text-slate-600 mt-2">
                            Default: {formatCurrency(goal.targetAmount, currency)} in {goal.targetMonths} months
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 ${
                            goal.selected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {goal.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Add Custom Goal */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Or add a custom goal (e.g. Wedding, MBA Fund, Laptop)..."
                  value={customGoalTitle}
                  onChange={(e) => setCustomGoalTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
                <select
                  value={customGoalType}
                  onChange={(e) => setCustomGoalType(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="short_term">Short-Term (&lt;1 yr)</option>
                  <option value="long_term">Long-Term (&gt;1 yr)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddCustomGoal}
                  disabled={!customGoalTitle.trim()}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  Add Goal
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                Quantify target amounts and timelines for your <span className="font-semibold text-slate-900">{selectedGoals.length} selected goals</span>. 
                We compute the required monthly savings pace in real-time.
              </p>

              {selectedGoals.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No goals selected yet.</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    Go back to Step 1 to pick goals
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedGoals.map((goal) => {
                    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                    const monthlyReq = goal.targetMonths > 0 ? Math.ceil(remaining / goal.targetMonths) : 0;
                    const weeklyReq = Math.ceil(monthlyReq / 4.33);

                    return (
                      <div key={goal.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                          <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                            {goal.title}
                            <span className="text-xs font-normal text-slate-500">
                              · {goal.type === 'short_term' ? 'Short Term' : 'Long Term'}
                            </span>
                          </span>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Requires {formatCurrency(monthlyReq, currency)}/mo ({formatCurrency(weeklyReq, currency)}/wk)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Target Goal Amount
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1000"
                                step="5000"
                                value={goal.targetAmount}
                                onChange={(e) => updateGoalField(goal.id, 'targetAmount', Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-emerald-600"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Current Saved Amount
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="2000"
                              value={goal.currentAmount}
                              onChange={(e) => updateGoalField(goal.id, 'currentAmount', Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Target Timeline (Months)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={goal.targetMonths}
                              onChange={(e) => updateGoalField(goal.id, 'targetMonths', Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Total Monthly Savings Pace Required</p>
                      <p className="text-xl font-bold text-slate-900 font-display">
                        {formatCurrency(totalMonthlySavingsRequired, currency)} <span className="text-xs text-slate-500 font-normal">per month</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">Weekly Target</p>
                      <p className="text-base font-bold text-emerald-700">
                        {formatCurrency(Math.ceil(totalMonthlySavingsRequired / 4.33), currency)}/wk
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                To evaluate whether these targets are achievable, let’s establish your take-home cash baseline.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Net Monthly Take-Home Income
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Salary, recurring freelance, or business draw after taxes.</p>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    step="5000"
                    className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[60000, 95000, 150000, 250000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMonthlyIncome(preset)}
                        className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        {formatCurrency(preset, currency)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fixed Monthly Commitments
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Rent / mortgage, debt EMIs, insurance, utility bills.</p>
                  <input
                    type="number"
                    value={monthlyFixedCosts}
                    onChange={(e) => setMonthlyFixedCosts(Number(e.target.value))}
                    step="2000"
                    className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <div className="flex gap-2 mt-2">
                    {[30000, 42000, 65000, 100000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMonthlyFixedCosts(preset)}
                        className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                      >
                        {formatCurrency(preset, currency)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Baseline Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Baseline Cash Available for Savings & Living</p>
                  <p className="text-2xl font-bold font-display text-emerald-400">
                    {formatCurrency(baselineSurplus, currency)}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                  <p className="text-xs text-slate-400">Fixed Cost Ratio</p>
                  <p className="text-base font-semibold text-slate-200">
                    {monthlyIncome > 0 ? Math.round((monthlyFixedCosts / monthlyIncome) * 100) : 0}% of net income
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Coach Diagnosis Box */}
              <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950 text-white shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Coach Nivesh · Spending Pattern Impact Diagnosis</span>
                </div>
                <h3 className="text-lg font-bold font-display leading-snug">
                  {monthlyGap > 0
                    ? `Your goals require ${formatCurrency(totalMonthlySavingsRequired, currency)}/mo, but current spending leaks create a ${formatCurrency(monthlyGap, currency)} monthly drag.`
                    : `Great baseline! With smart leak control, you can hit all ${selectedGoals.length} goals up to 3 months early.`}
                </h3>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Most budgeting apps simply tell you "stop spending". That doesn't work. Instead, we plug three specific friction leaks
                  so you fund your emergency safety cushion and car down payment without living like a monk.
                </p>
              </div>

              {/* 3 Spending Pattern Leaks Identified */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Identified Spending Leaks Impeding Your Goals:
                </h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Food Delivery Surge (Swiggy/Zomato)</span>
                        <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
                          Bleeds {formatCurrency(13800, currency)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        High frequency (21 orders/mo) with ₹2,400 spent purely on platform fees and surge pricing.
                      </p>
                      <p className="text-xs font-medium text-emerald-700 mt-1.5 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Coach Impact: Capping takeout to 2 weekend nights saves {formatCurrency(6500, currency)}/mo, moving Emergency Fund completion 2.4 months earlier.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Ghost Subscriptions (Cult.fit & Duplicate OTT)</span>
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                          Bleeds {formatCurrency(2890, currency)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Active autopays for gym with 0 check-ins in 38 days + duplicate Netflix & Hotstar tiers.
                      </p>
                      <p className="text-xs font-medium text-emerald-700 mt-1.5 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Coach Impact: Canceling duplicates frees {formatCurrency(1900, currency)}/mo directly to prepay Student Loan principal.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Weekend Impulse Carts & Quick Commerce</span>
                        <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          Bleeds {formatCurrency(8400, currency)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Friday evening through Sunday impulse buying on Blinkit and retail apps.
                      </p>
                      <p className="text-xs font-medium text-emerald-700 mt-1.5 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        Coach Impact: 48-hr rule saves {formatCurrency(4200, currency)}/mo, accelerating your Car Down Payment by 4 months.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Weekly Prescription Preview */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-center gap-2 font-semibold text-sm text-emerald-900 mb-1">
                  <span>⚡</span>
                  <span>Your First Weekly Prescribed Action:</span>
                </div>
                <p className="text-xs text-emerald-800">
                  <strong className="text-emerald-950">"Move {formatCurrency(5000, currency)} to your Emergency Fund this Friday."</strong>{' '}
                  Pay yourself first before the weekend begins. One click inside your action center executes and logs it.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && selectedGoals.length === 0}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <span>Accept Plan & Launch Coach</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
