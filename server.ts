import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Chat Endpoint with server-side Gemini 3.8 Flash & Grounded Context
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, inventorySnapshot } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Fallback message indicating server key absent; will trigger client-side heuristic engine
      return res.status(200).json({
        reply: null,
        mode: 'fallback',
        message: 'No GEMINI_API_KEY configured on server. Switching to local rule-based heuristic engine.',
      });
    }

    const systemInstruction = `
You are the AI Inventory & Supply Chain Engine for a modern retail chain enterprise.
You are given real-time inventory and supplier snapshot data.
Provide direct, concise, professional, data-driven answers formatted in clean Markdown with bullet points and bold emphasis.
Focus on reducing stock-outs, cutting carrying costs, and choosing the optimal supplier based on lead time, quality, and unit pricing.
Snapshot data provided:
${JSON.stringify(inventorySnapshot || {}, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = response.text || 'Unable to generate response.';
    return res.status(200).json({ reply, mode: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API execution error:', error?.message || error);
    return res.status(200).json({
      reply: null,
      mode: 'fallback',
      error: error?.message,
    });
  }
});

// Comprehensive AI Inventory Analysis Endpoint
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { products, suppliers } = req.body;

    if (!ai) {
      return res.status(200).json({ mode: 'fallback' });
    }

    const prompt = `
Perform a high-level strategic supply chain audit for the current inventory.
Products summary: ${JSON.stringify(
      (products || []).slice(0, 15).map((p: any) => ({
        name: p.name,
        stock: p.currentStock,
        dailySales: p.averageDailySales,
        leadTime: p.leadTime,
        status: p.status,
      }))
    )}
Suppliers summary: ${JSON.stringify(
      (suppliers || []).map((s: any) => ({
        name: s.name,
        onTimeRate: s.onTimeDeliveryRate,
        leadTime: s.averageDeliveryTime,
        rating: s.qualityRating,
      }))
    )}

Provide:
1. Executive Summary
2. Key Operational Alerts
3. Immediate Reorder Recommendations
4. Top Supplier Recommendation and why.
Keep response concise and actionable.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.status(200).json({
      analysis: response.text,
      mode: 'gemini',
    });
  } catch (error: any) {
    console.error('AI Analyze error:', error?.message || error);
    return res.status(200).json({ mode: 'fallback' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    geminiConfigured: !!ai,
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (!isProduction) {
    // In development: mount Vite as middleware so HMR/dev serving works seamlessly on port 3000
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventory & Supplier Management System server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
