import React, { useState, useRef, useEffect } from 'react';
import { CoachMessage, FinancialGoal, Transaction, UserProfile, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Send, Sparkles, User, Bot, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface CoachChatDrawerProps {
  userProfile: UserProfile;
  goals: FinancialGoal[];
  transactions: Transaction[];
  currency: CurrencyCode;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onPrescribeCustomAction?: (title: string, amount: number) => void;
}

export const CoachChatDrawer: React.FC<CoachChatDrawerProps> = ({
  userProfile,
  goals,
  transactions,
  currency,
  initialPrompt,
  onClearInitialPrompt,
  onPrescribeCustomAction,
}) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello ${userProfile.name.split(' ')[0]}! I am **${userProfile.coachName || 'Coach Paisa'}**.

Unlike conventional budgeting apps that just show colorful charts and leave you stressed, my sole purpose is giving you **exact, high-impact moves**.

Right now:
- You have **${goals.length} active goals** (Emergency Fund, Student Loan, New Car).
- Your baseline surplus is **${formatCurrency(userProfile.monthlyIncome - userProfile.monthlyFixedCosts, currency)}/mo**, but leaks are siphoning off approx **${formatCurrency(25090, currency)}/mo**.
- Your top priority action this week: **Move ${formatCurrency(5000, currency)} into your Liquid Emergency Fund** this Friday.

Ask me anything about your numbers, your timeline, or how to negotiate expenses!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            goals,
            transactions: transactions.slice(0, 30),
            currency,
            monthlyIncome: userProfile.monthlyIncome,
            monthlyFixedCosts: userProfile.monthlyFixedCosts,
            coachName: userProfile.coachName || 'Coach Paisa',
            appName: userProfile.appName || 'PaisaWise AI',
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: CoachMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I reviewed your numbers. Let us take concrete action.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reach Coach Nivesh. Please check network or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const PROMPT_SUGGESTIONS = [
    'How do I move ₹5,000 this Friday without feeling broke?',
    'Should I pay off my student loan first or build an emergency fund?',
    'How much earlier will I get my new car if I cut Swiggy by half?',
    'Give me a 3-step action plan for this weekend.',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-175px)] sm:h-[750px] min-h-[460px] overflow-hidden">
      
      {/* Coach Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base">{userProfile.coachName || 'Coach Paisa'}</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                AI Financial Action Coach
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aware of your {formatCurrency(userProfile.monthlyIncome, currency)} income & {goals.length} active goals
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'reset',
                role: 'assistant',
                content: 'Chat session refreshed. What financial goal or expense move shall we tackle next?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          title="Reset Chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {msg.content.split('\n\n').map((para, idx) => (
                  <p key={idx}>
                    {para.split('**').map((chunk, cIdx) => (
                      cIdx % 2 === 1 ? (
                        <strong key={cIdx} className={msg.role === 'user' ? 'text-emerald-300' : 'text-slate-950 font-bold'}>
                          {chunk}
                        </strong>
                      ) : (
                        <span key={cIdx}>{chunk}</span>
                      )
                    ))}
                  </p>
                ))}
              </div>
              <div
                className={`text-[10px] mt-1.5 text-right ${
                  msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Coach Nivesh is formulating your personalized action plan...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-slate-100/60 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-600" />
          <span>Quick:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="text-xs whitespace-nowrap bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Coach Nivesh: 'How can I save ₹6,000 this month?' or 'Break down my dining leaks'..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-emerald-600 bg-slate-50/50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </form>

    </div>
  );
};
