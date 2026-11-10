import confetti from 'canvas-confetti';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'INR'): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (currencyCode === 'INR') {
    // Indian numbering format (Lakhs / Crores)
    formatted = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  } else {
    formatted = absAmount.toLocaleString(config.locale, {
      maximumFractionDigits: 0,
    });
  }

  const sign = amount < 0 ? '-' : '';
  return `${sign}${config.symbol}${formatted}`;
}

export function triggerCelebration() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6'],
    });
  } catch (err) {
    console.warn('Confetti effect failed', err);
  }
}

export function calculateMonthsRemaining(target: number, current: number, monthlySave: number): number {
  const remaining = Math.max(0, target - current);
  if (monthlySave <= 0) return 999;
  return Math.ceil(remaining / monthlySave);
}

export function addMonthsToDate(monthsToAdd: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAdd);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
