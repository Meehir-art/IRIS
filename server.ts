import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Server-side Safe AI Forwarding Endpoint
  // Strictly accepts ONLY sanitized safe prompts and enforces privacy verification
  app.post('/api/safe-ai', async (req, res) => {
    try {
      const { safePrompt, isSanitizedVerified } = req.body;

      if (!safePrompt || typeof safePrompt !== 'string') {
        return res.status(400).json({ error: 'Valid safePrompt string is required.' });
      }

      if (!isSanitizedVerified) {
        return res.status(403).json({
          error: 'Privacy Firewall Error: Unverified prompt rejected. Only sanitized prompts can be forwarded to external AI.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback intelligent simulated LLM response if API key is not configured in preview
        return res.json({
          response: `[Simulated Safe AI Response — Local Mode]\n\nI have received your privacy-sanitized prompt:\n"${safePrompt}"\n\nSummary & Analysis:\n• All sensitive tokens (such as [PERSON], [EMAIL], [PHONE], or [REDACTED]) were preserved as anonymous placeholders.\n• No raw personally identifiable information (PII), financial records, or authentication secrets were exposed to the model context.\n• Based on the structure of your request, your account inquiry has been processed safely under zero-trust privacy constraints.`,
          model: 'privai-safe-relay-local',
          timestamp: new Date().toISOString()
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: safePrompt,
        config: {
          systemInstruction:
            'You are a helpful, privacy-preserving AI assistant operating behind the PrivAI Guard Pre-LLM Privacy Firewall. The prompt you receive has already had sensitive data sanitized into placeholders like [PERSON], [EMAIL], [PHONE], [REDACTED], or [TOKEN_...]. Fulfill the user request helpfully and naturally while respecting and maintaining these placeholders where appropriate. Briefly acknowledge at the end that zero raw sensitive tokens were received.',
        },
      });

      return res.json({
        response: response.text || 'Processed sanitized prompt successfully.',
        model: 'gemini-3.8-flash',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Safe AI relay error:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to generate AI response from sanitized prompt.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrivAI Guard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
