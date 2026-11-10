import { FinancialGoal, Transaction, SpendingLeak, WeeklyAction, UserProfile, CurrencyConfig } from '../types';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Arjun Verma',
  monthlyIncome: 95000,
  monthlyFixedCosts: 42000, // Rent ₹25,000 + Loan EMI ₹12,000 + Utilities ₹5,000
  currentSavings: 65000,
  currency: 'INR',
  isProUser: false,
  appName: 'Kuber AI',
  coachName: 'Coach Kuber',
  onboardingCompleted: true, // will allow user to re-run guided flow anytime
  riskTolerance: 'balanced',
};

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-emergency',
    title: '3-Month Emergency Fund Buffer',
    category: 'emergency_fund',
    type: 'short_term',
    targetAmount: 150000,
    currentAmount: 55000,
    targetMonths: 6,
    monthlyRequired: 15833,
    deadlineDate: '2027-05',
    priority: 'high',
    notes: 'Liquid fixed deposit / sweep-in savings account for emergencies.',
  },
  {
    id: 'goal-student-loan',
    title: 'Prepay High-Interest Student Loan',
    category: 'debt_payoff',
    type: 'short_term',
    targetAmount: 180000,
    currentAmount: 60000,
    targetMonths: 10,
    monthlyRequired: 12000,
    deadlineDate: '2027-09',
    priority: 'high',
    notes: 'Accelerating principal repayment at 10.5% interest rate to save on interest.',
  },
  {
    id: 'goal-car',
    title: 'New Car Down Payment (EV / Compact SUV)',
    category: 'vehicle',
    type: 'long_term',
    targetAmount: 350000,
    currentAmount: 70000,
    targetMonths: 16,
    monthlyRequired: 17500,
    deadlineDate: '2028-03',
    priority: 'medium',
    notes: 'Saving for 40% down payment to minimize EMI interest burden.',
  },
];

export const INITIAL_LEAKS: SpendingLeak[] = [
  {
    id: 'leak-1',
    title: 'Hyper-Frequent Food Delivery Surge',
    category: 'Dining & Takeout',
    monthlyBleed: 13800,
    frequency: '21 orders / month',
    plainLanguageDiagnosis:
      'You are ordering takeout 5 days a week after work. Surge charges, packaging, and platform fees alone add ₹2,400/month on top of the food.',
    prescribedAction: 'Cook 2 dinners on weeknights and cap weekend takeout to ₹1,500 total.',
    goalImpact: 'Frees up ₹6,500/month, hitting your Emergency Fund 2.4 months ahead of schedule.',
    difficulty: 'quick-win',
  },
  {
    id: 'leak-2',
    title: 'Ghost & Duplicate Subscriptions',
    category: 'Subscriptions & Software',
    monthlyBleed: 2890,
    frequency: '5 active recurring autopays',
    plainLanguageDiagnosis:
      'You have both Netflix Ultra HD and Amazon Prime, plus an inactive Cult.fit gym pass that has not logged attendance in 38 days.',
    prescribedAction: 'Pause gym membership and downgrade Netflix to standard family tier.',
    goalImpact: 'Saves ₹1,900/month directly redirected to your Student Loan payoff.',
    difficulty: 'quick-win',
  },
  {
    id: 'leak-3',
    title: 'Weekend Impulse Retail & Quick-Commerce Delivery',
    category: 'Shopping & Discretionary',
    monthlyBleed: 8400,
    frequency: 'Spikes every Saturday & Sunday',
    plainLanguageDiagnosis:
      '72% of your discretionary spending happens between Friday 8 PM and Sunday midnight, mostly on rapid grocery delivery and impulse shopping.',
    prescribedAction: 'Institute a mandatory 48-hour cooling-off rule on any non-essential cart above ₹1,000.',
    goalImpact: 'Recovers ₹4,200/month, accelerating your New Car down payment date by 4 full months.',
    difficulty: 'medium',
  },
];

export const INITIAL_WEEKLY_ACTIONS: WeeklyAction[] = [
  {
    id: 'act-1',
    title: 'Move ₹5,000 to your Emergency Fund this Friday',
    actionType: 'transfer_savings',
    amount: 5000,
    targetGoalId: 'goal-emergency',
    deadline: 'Friday, 6:00 PM',
    reason: 'Pay yourself first right after your mid-month pay before weekend spending begins.',
    impactDescription: '+3.3% progress toward your ₹1,50,000 safety cushion.',
    isCompleted: false,
  },
  {
    id: 'act-2',
    title: 'Pause Inactive Gym Subscription & Save ₹1,400',
    actionType: 'cancel_sub',
    amount: 1400,
    targetGoalId: 'goal-student-loan',
    deadline: 'Tomorrow',
    reason: 'Zero check-ins in the last 30 days. Auto-renew will charge in 4 days.',
    impactDescription: 'Redirects ₹1,400/mo into student loan principal reduction.',
    isCompleted: false,
  },
  {
    id: 'act-3',
    title: 'Cap Weekend Food Delivery at ₹1,500',
    actionType: 'cap_spend',
    amount: 2200,
    targetGoalId: 'goal-car',
    deadline: 'Sunday midnight',
    reason: 'Last weekend food delivery reached ₹3,700. Capping saves ₹2,200 immediately.',
    impactDescription: 'Saves ₹2,200 cash to accelerate your car down payment fund.',
    isCompleted: false,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', date: '2026-11-08', merchant: 'Swiggy Gourmet', amount: 1420, type: 'expense', category: 'Dining & Takeout', isLeak: true, leakReason: 'Dinner takeout surge' },
  { id: 'tx-2', date: '2026-11-07', merchant: 'Blinkit Instant Groceries', amount: 890, type: 'expense', category: 'Groceries & Delivery', isLeak: true, leakReason: 'Impulse late-night snacks' },
  { id: 'tx-3', date: '2026-11-06', merchant: 'HDFC Education Loan EMI', amount: 12000, type: 'expense', category: 'EMIs & Loans', isRecurring: true },
  { id: 'tx-4', date: '2026-11-05', merchant: 'TechCorp Salary Credit', amount: 95000, type: 'income', category: 'Salary & Income', isRecurring: true },
  { id: 'tx-5', date: '2026-11-04', merchant: 'House Rent (UPI to Landlord)', amount: 25000, type: 'expense', category: 'Rent & Housing', isRecurring: true },
  { id: 'tx-6', date: '2026-11-03', merchant: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Subscriptions & Software', isRecurring: true, isLeak: true, leakReason: 'Duplicate streaming' },
  { id: 'tx-7', date: '2026-11-03', merchant: 'Cult.fit Gym Autopay', amount: 1750, type: 'expense', category: 'Subscriptions & Software', isRecurring: true, isLeak: true, leakReason: 'Zero attendance 38d' },
  { id: 'tx-8', date: '2026-11-02', merchant: 'Zomato Biryani', amount: 980, type: 'expense', category: 'Dining & Takeout', isLeak: true },
  { id: 'tx-9', date: '2026-11-01', merchant: 'Uber Peak Surge', amount: 620, type: 'expense', category: 'Travel & Commute', isLeak: true, leakReason: 'Surge cab vs metro' },
  { id: 'tx-10', date: '2026-10-31', merchant: 'Zara Weekend Shopping', amount: 4850, type: 'expense', category: 'Shopping & Discretionary', isLeak: true, leakReason: 'Unplanned clothing retail' },
  { id: 'tx-11', date: '2026-10-30', merchant: 'Nature Basket Supermarket', amount: 3200, type: 'expense', category: 'Groceries & Delivery' },
  { id: 'tx-12', date: '2026-10-28', merchant: 'Broadband Internet', amount: 1199, type: 'expense', category: 'Utilities', isRecurring: true },
  { id: 'tx-13', date: '2026-10-26', merchant: 'Swiggy Lunch Box', amount: 420, type: 'expense', category: 'Dining & Takeout' },
  { id: 'tx-14', date: '2026-10-24', merchant: 'Amazon Prime Annual Share', amount: 1499, type: 'expense', category: 'Subscriptions & Software', isRecurring: true },
  { id: 'tx-15', date: '2026-10-22', merchant: 'Blue Tokai Coffee', amount: 380, type: 'expense', category: 'Dining & Takeout' },
  { id: 'tx-16', date: '2026-10-20', merchant: 'Electricity BESCOM', amount: 1850, type: 'expense', category: 'Utilities', isRecurring: true },
];

export const SAMPLE_SMS_STRINGS = `Sent Rs.1,420.00 via UPI to SWIGGY on 08-Nov-26 Ref 431092837. Avail Bal: Rs 64,280.
Debited Rs.890.00 from A/C XX4921 for BLINKIT GROCERIES on 07-Nov-26.
Txn of Rs.12,000.00 done on HDFC BANK towards LOAN EMI A/C 981249 on 06-Nov-26.
Salary credited! Rs.95,000.00 received from TECHCORP SOLUTIONS on 05-Nov-26.
UPI transfer of Rs.25,000.00 to SURESH KUMAR (RENT) successful on 04-Nov-26.
Auto-debit of Rs.649.00 processed for NETFLIX INDIA on 03-Nov-26.
Auto-debit of Rs.1,750.00 for CULTFIT PASS on 03-Nov-26.
Paid Rs.980.00 to ZOMATO on 02-Nov-26 via Google Pay.
Paid Rs.620.00 for UBER RIDE BANGALORE on 01-Nov-26.
Rs.4,850.00 spent on Credit Card ending 7012 at ZARA INDIRANAGAR on 31-Oct-26.`;
