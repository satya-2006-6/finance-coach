import React, { useState, useEffect } from 'react';
import { FinancialGoal, Transaction, SpendingLeak, WeeklyAction, UserProfile, CurrencyCode } from './types';
import { INITIAL_USER_PROFILE, INITIAL_GOALS, INITIAL_LEAKS, INITIAL_WEEKLY_ACTIONS, INITIAL_TRANSACTIONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { WeeklyActionCenter } from './components/WeeklyActionCenter';
import { GoalsView } from './components/GoalsView';
import { SpendingLeaksView } from './components/SpendingLeaksView';
import { CoachChatDrawer } from './components/CoachChatDrawer';
import { BillNegotiatorView } from './components/BillNegotiatorView';
import { SecurityVaultView } from './components/SecurityVaultView';
import { GoalSetupModal } from './components/GoalSetupModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { RenameAppModal } from './components/RenameAppModal';
import { triggerCelebration } from './utils/formatters';

export default function App() {
  // Load or initialize state from localStorage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nivesh_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.appName || parsed.appName === 'PaisaWise AI' || parsed.appName === 'Nivesh AI') parsed.appName = 'Kuber AI';
        if (!parsed.coachName || parsed.coachName === 'Coach Paisa' || parsed.coachName === 'Coach Nivesh') parsed.coachName = 'Coach Kuber';
        return parsed;
      } catch (e) {}
    }
    return INITIAL_USER_PROFILE;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('nivesh_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_GOALS;
  });

  const [leaks, setLeaks] = useState<SpendingLeak[]>(() => {
    const saved = localStorage.getItem('nivesh_leaks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_LEAKS;
  });

  const [actions, setActions] = useState<WeeklyAction[]>(() => {
    const saved = localStorage.getItem('nivesh_actions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_WEEKLY_ACTIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nivesh_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_TRANSACTIONS;
  });

  // UI state
  const [currentTab, setCurrentTab] = useState<string>('actions');
  const [showGoalSetupModal, setShowGoalSetupModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(false);
  const [chatPrompt, setChatPrompt] = useState<string>('');

  // Sync document title with current app name
  useEffect(() => {
    const brand = userProfile.appName || 'Kuber AI';
    document.title = `${brand} — Actionable Personal Finance Coach`;
  }, [userProfile.appName]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('nivesh_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('nivesh_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('nivesh_leaks', JSON.stringify(leaks));
  }, [leaks]);

  useEffect(() => {
    localStorage.setItem('nivesh_actions', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('nivesh_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Action complete handler
  const handleCompleteAction = (actionId: string) => {
    const targetAction = actions.find((a) => a.id === actionId);
    if (!targetAction) return;

    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? { ...a, isCompleted: true, completedAt: new Date().toISOString() }
          : a
      )
    );

    // If tied to a specific goal, add to its current saved amount
    if (targetAction.targetGoalId) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === targetAction.targetGoalId
            ? { ...g, currentAmount: g.currentAmount + (targetAction.amount || 0) }
            : g
        )
      );
    }
  };

  // Add custom action
  const handleAddCustomAction = (newAction: Omit<WeeklyAction, 'id' | 'isCompleted'>) => {
    const actionItem: WeeklyAction = {
      ...newAction,
      id: `action-${Date.now()}`,
      isCompleted: false,
    };
    setActions((prev) => [actionItem, ...prev]);
  };

  // Add funds directly to goal
  const handleUpdateGoalAmount = (goalId: string, addedAmount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + addedAmount } : g
      )
    );
  };

  // Save goals and profile from guided onboarding modal
  const handleSaveGoalsAndProfile = (newGoals: FinancialGoal[], updatedProfile: Partial<UserProfile>) => {
    setGoals(newGoals);
    setUserProfile((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
    // Also create fresh actions based on the new goals
    if (newGoals.length > 0) {
      const primaryGoal = newGoals[0];
      const recommendedSavings = Math.round(primaryGoal.monthlyRequired / 4);
      const generatedAction: WeeklyAction = {
        id: `act-new-${Date.now()}`,
        title: `Move ${userProfile.currency === 'INR' ? '₹' : '$'}${recommendedSavings.toLocaleString()} to ${primaryGoal.title} this Friday`,
        actionType: 'transfer_savings',
        amount: recommendedSavings,
        targetGoalId: primaryGoal.id,
        deadline: 'This Friday',
        reason: 'Automated transfer right after salary credit ensures you hit your timeline target.',
        impactDescription: `Accelerates your ${primaryGoal.title} completion date.`,
        isCompleted: false,
      };
      setActions((prev) => [generatedAction, ...prev]);
    }
  };

  // Prescribe an action directly from an identified spending leak
  const handlePrescribeActionFromLeak = (leak: SpendingLeak) => {
    const newAction: WeeklyAction = {
      id: `act-leak-${Date.now()}`,
      title: leak.prescribedAction,
      actionType: 'cap_spend',
      amount: Math.round(leak.monthlyBleed / 4),
      deadline: 'This Weekend',
      reason: leak.plainLanguageDiagnosis,
      impactDescription: leak.goalImpact,
      isCompleted: false,
    };
    setActions((prev) => [newAction, ...prev]);
    setCurrentTab('actions');
    triggerCelebration();
  };

  // Add transactions
  const handleAddTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  // Re-analyze spending with Gemini
  const handleRefreshFromCoach = async () => {
    setIsLoadingCoach(true);
    try {
      const response = await fetch('/api/coach/analyze-leaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          transactions,
          monthlyIncome: userProfile.monthlyIncome,
          currency: userProfile.currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      if (data.leaks && Array.isArray(data.leaks)) {
        setLeaks(data.leaks);
      }
      if (data.weeklyPrescription && Array.isArray(data.weeklyPrescription)) {
        const freshActions: WeeklyAction[] = data.weeklyPrescription.map((p: any, idx: number) => ({
          id: `coach-presc-${Date.now()}-${idx}`,
          title: p.action,
          actionType: 'transfer_savings',
          amount: Number(p.amount) || 2500,
          deadline: p.deadline || 'This Sunday',
          reason: p.impactDescription || 'Recommended by Coach Nivesh based on recent spending patterns.',
          impactDescription: p.impactDescription || 'Saves money towards your active goal.',
          isCompleted: false,
        }));
        setActions((prev) => [...freshActions, ...prev]);
      }
      triggerCelebration();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  // Reset to default seed
  const handleResetAllData = () => {
    localStorage.removeItem('nivesh_user_profile');
    localStorage.removeItem('nivesh_goals');
    localStorage.removeItem('nivesh_leaks');
    localStorage.removeItem('nivesh_actions');
    localStorage.removeItem('nivesh_transactions');

    setUserProfile(INITIAL_USER_PROFILE);
    setGoals(INITIAL_GOALS);
    setLeaks(INITIAL_LEAKS);
    setActions(INITIAL_WEEKLY_ACTIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentTab('actions');
  };

  const handleOpenCoachWithPrompt = (prompt: string) => {
    setChatPrompt(prompt);
    setCurrentTab('chat');
  };

  const pendingActionsCount = actions.filter((a) => !a.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currency={userProfile.currency}
        onSelectCurrency={(c: CurrencyCode) => setUserProfile((p) => ({ ...p, currency: c }))}
        onOpenGoalSetup={() => setShowGoalSetupModal(true)}
        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        isProUser={userProfile.isProUser}
        activeActionsCount={pendingActionsCount}
        appName={userProfile.appName || 'Kuber AI'}
        onOpenRenameModal={() => setShowRenameModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8">
        {currentTab === 'actions' && (
          <WeeklyActionCenter
            actions={actions}
            goals={goals}
            currency={userProfile.currency}
            onCompleteAction={handleCompleteAction}
            onAddCustomAction={handleAddCustomAction}
            onRefreshFromCoach={handleRefreshFromCoach}
            isLoadingCoach={isLoadingCoach}
            onOpenGoalSetup={() => setShowGoalSetupModal(true)}
            coachName={userProfile.coachName || 'Coach Kuber'}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            currency={userProfile.currency}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onOpenGoalSetup={() => setShowGoalSetupModal(true)}
            onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
          />
        )}

        {currentTab === 'leaks' && (
          <SpendingLeaksView
            leaks={leaks}
            transactions={transactions}
            currency={userProfile.currency}
            onAddTransactions={handleAddTransactions}
            onPrescribeActionFromLeak={handlePrescribeActionFromLeak}
          />
        )}

        {currentTab === 'chat' && (
          <CoachChatDrawer
            userProfile={userProfile}
            goals={goals}
            transactions={transactions}
            currency={userProfile.currency}
            initialPrompt={chatPrompt}
            onClearInitialPrompt={() => setChatPrompt('')}
          />
        )}

        {currentTab === 'negotiator' && (
          <BillNegotiatorView
            currency={userProfile.currency}
            isProUser={userProfile.isProUser}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
          />
        )}

        {currentTab === 'security' && (
          <SecurityVaultView
            userProfile={userProfile}
            goals={goals}
            transactions={transactions}
            currency={userProfile.currency}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Guided Goal Setup Modal */}
      <GoalSetupModal
        isOpen={showGoalSetupModal}
        onClose={() => setShowGoalSetupModal(false)}
        userProfile={userProfile}
        currentGoals={goals}
        onSaveGoalsAndProfile={handleSaveGoalsAndProfile}
        currency={userProfile.currency}
      />

      {/* Freemium / Pro Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        isProUser={userProfile.isProUser}
        onTogglePro={(isPro) => setUserProfile((p) => ({ ...p, isProUser: isPro }))}
        currency={userProfile.currency}
      />

      {/* Rename Brand Modal */}
      <RenameAppModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        currentAppName={userProfile.appName || 'Kuber AI'}
        currentCoachName={userProfile.coachName || 'Coach Kuber'}
        onSaveName={(newApp, newCoach) => {
          setUserProfile((p) => ({ ...p, appName: newApp, coachName: newCoach }));
        }}
      />

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{userProfile.appName || 'Kuber AI'}</span>
            <span>· Actionable Personal Finance Coach</span>
          </div>
          <div>
            Built with Gemini AI · Local-First Security · Zero Bank Credentials Required
          </div>
        </div>
      </footer>

    </div>
  );
}
