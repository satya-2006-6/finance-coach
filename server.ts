import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: AI Coach Chat
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const { goals = [], transactions = [], currency = '₹', monthlyIncome = 0, monthlyFixedCosts = 0, coachName = 'Coach Kuber', appName = 'Kuber AI' } = context || {};

    const systemInstruction = `You are "${coachName}" from "${appName}", an elite, empathetic, and hyper-actionable AI Personal Finance Coach specializing in real behavioral change.
Most budgeting tools fail because they just show charts. Your superpower is telling the user EXACTLY WHAT TO DO NEXT in plain, punchy language.

USER CONTEXT:
- Currency: ${currency}
- Monthly Income: ${currency}${monthlyIncome.toLocaleString()}
- Fixed Essentials (Rent, EMI, Utilities): ${currency}${monthlyFixedCosts.toLocaleString()}
- Active Goals: ${JSON.stringify(goals)}
- Recent Spending Summary: ${transactions.length} recorded transactions.

COACHING PRINCIPLES:
1. SPECIFICITY OVER GENERALITY: Never say "try to save more on dining". Instead say: "You spent ${currency}14,200 on Swiggy/Zomato last month across 23 orders. If you cap takeout to Friday & Saturday nights, you immediately free up ${currency}6,000/month. That accelerates your Emergency Fund by 3.4 months!"
2. PRESCRIPTIVE ACTIONS: Always recommend 1 or 2 concrete immediate steps (e.g., "Step 1: Set a recurring auto-debit of ${currency}3,500 on the 5th of each month right after salary day").
3. NO SHAME, JUST MATH & PSYCHOLOGY: Money is emotional. Normalize slip-ups, identify emotional spending triggers (stress eating, weekend impulse browsing), and provide frictionless wins.
4. REGIONAL FLUENCY: Understand UPI, credit card reward traps, SIPs, EMIs, rent inflation, high dining delivery fees, and emergency fund sizing (3 to 6 months of expenses).
5. FORMATTING: Use clean markdown, bold key numbers and action items, and keep responses concise and engaging (avoid long boring essay blocks).`;

    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I analyzed your numbers. Let us take the next concrete action.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate coach response.',
    });
  }
});

// Endpoint: Deep Spending Leak Analysis & Goal Impact
app.post('/api/coach/analyze-leaks', async (req, res) => {
  try {
    const { goals, transactions, monthlyIncome, currency = '₹' } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Analyze this user's spending data and financial goals to identify actionable money leaks and quantify their direct impact on their goals.

Financial Context:
- Monthly Net Income: ${currency}${monthlyIncome || 85000}
- Current Goals: ${JSON.stringify(goals || [])}
- Transactions: ${JSON.stringify(transactions || []).slice(0, 15000)}

Provide a structured JSON output with:
1. "headlineSummary": A punchy 1-sentence plain-language diagnosis of where their money is bleeding and the prize for fixing it.
2. "totalMonthlyLeak": Estimated total amount of avoidable or high-friction spending in ${currency} per month.
3. "leaks": Array of leak objects:
   - "id": string
   - "title": string (e.g. "Frequent Food Delivery Surge", "Ghost Subscriptions", "Late Night Weekend UPIs")
   - "category": string
   - "monthlyBleed": number (in the user's currency)
   - "plainLanguageDiagnosis": string explaining the behavioral pattern in relatable language
   - "prescribedAction": string with exact actionable instruction (e.g. "Move ₹4,000 to Emergency Fund today", "Cancel gym membership auto-renewal")
   - "goalImpact": string detailing how doing this action accelerates their target goal (e.g., "Hits your New Car Down Payment 2.5 months earlier")
   - "difficulty": "quick-win" | "medium" | "hard"
4. "weeklyPrescription": An array of 3 concrete tasks for THIS WEEK:
   - "action": string
   - "amount": number
   - "impactDescription": string
   - "deadline": string (e.g., "By Friday 6 PM")

Respond strictly with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/analyze-leaks:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze spending leaks.' });
  }
});

// Endpoint: Parse Bank Statement / SMS Text into Transactions
app.post('/api/coach/parse-statement', async (req, res) => {
  try {
    const { rawText, currency = '₹' } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Raw statement text or SMS strings are required.' });
    }
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `You are a financial statement and SMS parser. Extract transactions from the following raw text (which may be copied from bank statements, credit card bills, or bank SMS alerts like UPI debits/credits).

Raw Input:
"""
${rawText.slice(0, 20000)}
"""

Extract an array of transactions in JSON format.
Each transaction must have:
- "date": string (YYYY-MM-DD or recent date)
- "merchant": clean merchant or recipient name (e.g. "Swiggy", "Netflix", "HDFC Bank EMI", "Salary TechCorp", "Uber", "Blinkit", "Starbucks")
- "amount": number (positive numeric value)
- "type": "expense" | "income"
- "category": one of ["Dining & Takeout", "Groceries & Delivery", "Rent & Housing", "EMIs & Loans", "Subscriptions & Software", "Travel & Commute", "Shopping & Discretionary", "Utilities", "Salary & Income", "Investments", "Healthcare", "Other"]
- "isRecurring": boolean
- "isLeak": boolean (true if it represents impulse spending, high takeout, unused subscription, fees)
- "notes": short explanation or reference

Return JSON format: { "transactions": [...] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"transactions":[]}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/parse-statement:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse statement.' });
  }
});

// Endpoint: AI Bill Negotiator Script Generator (Freemium / Pro Feature)
app.post('/api/coach/negotiate-bill', async (req, res) => {
  try {
    const { billType, providerName, currentMonthlyCost, yearsWithProvider, currency = '₹' } = req.body;
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Generate a high-converting, professional negotiation script and tactic playbook for a customer negotiating their ${billType || 'broadband/internet'} bill with ${providerName || 'service provider'}.
Current Monthly Cost: ${currency}${currentMonthlyCost || 1200}
Loyalty: Customer for ${yearsWithProvider || 2} years.

Provide JSON:
- "targetSavings": expected monthly savings in ${currency} (e.g. ${currency}300 - ${currency}500/mo)
- "phoneScript": word-for-word conversational script to read to the retention agent
- "emailOrChatScript": ready-to-copy chat support / email template
- "tactics": array of 3 high-impact leverage tactics (e.g. mentioning competitor plan, requesting retention desk, timing at end of month)
- "estimatedAnnualSavings": number`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/negotiate-bill:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate negotiation script.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
