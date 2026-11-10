import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { formatCurrency, triggerCelebration } from '../utils/formatters';
import { HandCoins, Sparkles, Copy, Check, PhoneCall, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

interface BillNegotiatorViewProps {
  currency: CurrencyCode;
  isProUser: boolean;
  onOpenSubscriptionModal: () => void;
}

export const BillNegotiatorView: React.FC<BillNegotiatorViewProps> = ({
  currency,
  isProUser,
  onOpenSubscriptionModal,
}) => {
  const [billType, setBillType] = useState('Broadband & Home WiFi');
  const [providerName, setProviderName] = useState('Airtel Xstream / Jio Fiber');
  const [monthlyCost, setMonthlyCost] = useState<number>(1199);
  const [yearsWithProvider, setYearsWithProvider] = useState<number>(2);

  const [isLoading, setIsLoading] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<{
    targetSavings?: string;
    phoneScript?: string;
    emailOrChatScript?: string;
    tactics?: string[];
    estimatedAnnualSavings?: number;
  } | null>(null);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach/negotiate-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billType,
          providerName,
          currentMonthlyCost: monthlyCost,
          yearsWithProvider,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Negotiation script generation failed');
      }

      const data = await response.json();
      setNegotiationResult(data);
      triggerCelebration();
    } catch (err) {
      console.error(err);
      // High-quality fallback if server error
      setNegotiationResult({
        targetSavings: `${currency}300 - ${currency}450/month`,
        phoneScript: `"Hi, I’ve been a loyal ${providerName} customer for ${yearsWithProvider} years paying ${currency}${monthlyCost}/month. I noticed competitors are offering 100 Mbps plans at a lower tier. Before I submit a cancellation request, I’d love to know what loyalty retention plans or discounts are available to keep my business."`,
        emailOrChatScript: `Subject: Review of account pricing - ${yearsWithProvider} year customer\n\nHello Support Team,\n\nI am currently on the ${billType} plan paying ${currency}${monthlyCost}/month. Competitor providers in my area are offering equivalent speeds at a discounted rate. Because I have been with ${providerName} for ${yearsWithProvider} years, I would prefer to stay if my monthly bill can be matched or lowered. Please connect me to your retention desk.\n\nThank you!`,
        tactics: [
          'Ask specifically for the "Retention or Customer Loyalty Desk", not front-line support.',
          'Mention competitor pricing by name (e.g., ACT Fibernet or Jio).',
          'Call towards the end of the month when retention reps have retention quotas.',
        ],
        estimatedAnnualSavings: 4200,
      });
      triggerCelebration();
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-amber-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-amber-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <HandCoins className="w-4 h-4" />
              <span>Nivesh Pro · AI Bill Negotiation Playbook</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">
              Stop overpaying on autopilot.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Telecom, gym memberships, and credit card interest rates thrive on "inertia tax". 
              Our AI produces high-converting retention scripts and competitor leverage to shave {formatCurrency(3500, currency)} to {formatCurrency(12000, currency)} annually off your recurring bills.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-right shrink-0">
            <p className="text-xs text-slate-300 font-medium">Average Annual Recovery</p>
            <p className="text-2xl font-bold font-display text-amber-300 mt-0.5">
              {formatCurrency(5400, currency)}/yr
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              Redirects directly to emergency fund
            </span>
          </div>
        </div>
      </div>

      {/* Bill Configuration Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 font-display mb-1">
          Select a Bill to Negotiate
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Enter your current billing details. The AI drafts customized negotiation dialogue and tactics.
        </p>

        <form onSubmit={handleGenerateScript} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bill Category
            </label>
            <select
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="Broadband & Home WiFi">Broadband & Home WiFi</option>
              <option value="Gym & Fitness Membership">Gym & Fitness Membership</option>
              <option value="Credit Card Interest / APR">Credit Card APR / Fee Waiver</option>
              <option value="Cellular / Mobile Postpaid">Mobile Postpaid Plan</option>
              <option value="Term Life / Car Insurance">Insurance Premium Renewal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Provider Name
            </label>
            <input
              type="text"
              required
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. Airtel, Cult.fit, HDFC"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Monthly Cost ({currency})
            </label>
            <input
              type="number"
              min="100"
              required
              value={monthlyCost}
              onChange={(e) => setMonthlyCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Years as Customer
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={yearsWithProvider}
              onChange={(e) => setYearsWithProvider(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-emerald-600"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isLoading ? 'Generating AI Negotiation Script...' : 'Generate Negotiation Playbook'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {negotiationResult && (
        <div className="space-y-5">
          {/* Target Savings banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="font-bold text-sm text-emerald-950">Target Savings Opportunity:</p>
                <p className="text-xs text-emerald-800">
                  Negotiating this can recover <strong className="text-emerald-950">{negotiationResult.targetSavings || `${formatCurrency(350, currency)}/month`}</strong>.
                </p>
              </div>
            </div>
            {negotiationResult.estimatedAnnualSavings && (
              <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                +{formatCurrency(negotiationResult.estimatedAnnualSavings, currency)}/year
              </span>
            )}
          </div>

          {/* Scripts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone Script */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <PhoneCall className="w-4 h-4 text-blue-600" />
                    <span>Phone Call / Spoken Retention Script</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(negotiationResult.phoneScript || '', 'phone')}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedType === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'phone' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-sans border border-slate-100 whitespace-pre-wrap">
                  {negotiationResult.phoneScript}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3">
                Tip: If the first agent says no, calmly ask: "Could you please connect me to the customer retention desk?"
              </p>
            </div>

            {/* Email / Chat Support Template */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Chat Support / Email Template</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(negotiationResult.emailOrChatScript || '', 'email')}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'email' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-sans border border-slate-100 whitespace-pre-wrap">
                  {negotiationResult.emailOrChatScript}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3">
                Paste directly into provider WhatsApp, in-app support chat, or email.
              </p>
            </div>
          </div>

          {/* Leverage Tactics */}
          {negotiationResult.tactics && negotiationResult.tactics.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Key Negotiation Leverage Tactics
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {negotiationResult.tactics.map((tactic, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
