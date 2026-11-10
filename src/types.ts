export type CurrencyCode = 'INR' | 'USD' | 'SGD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: 'emergency_fund' | 'debt_payoff' | 'vehicle' | 'home' | 'vacation' | 'retirement' | 'custom';
  type: 'short_term' | 'long_term'; // short-term <= 12 mos, long-term > 12 mos
  targetAmount: number;
  currentAmount: number;
  targetMonths: number; // timeline in months
  monthlyRequired: number; // calculated targetAmount / targetMonths (or adjusted)
  deadlineDate: string; // YYYY-MM
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  isCompleted?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  isRecurring?: boolean;
  isLeak?: boolean;
  leakReason?: string;
}

export interface SpendingLeak {
  id: string;
  title: string;
  category: string;
  monthlyBleed: number;
  frequency: string; // e.g. "4x per week"
  plainLanguageDiagnosis: string;
  prescribedAction: string;
  goalImpact: string;
  difficulty: 'quick-win' | 'medium' | 'hard';
  resolved?: boolean;
}

export interface WeeklyAction {
  id: string;
  title: string;
  actionType: 'transfer_savings' | 'cancel_sub' | 'cap_spend' | 'negotiate_bill' | 'debt_prepay';
  amount: number;
  targetGoalId?: string;
  deadline: string;
  reason: string;
  impactDescription: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  monthlyFixedCosts: number; // Rent, EMI, Utilities
  currentSavings: number;
  currency: CurrencyCode;
  isProUser: boolean;
  onboardingCompleted: boolean;
  appName?: string;
  coachName?: string;
  riskTolerance: 'conservative' | 'balanced' | 'growth';
}

export interface CoachMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}
