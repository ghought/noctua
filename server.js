import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));

// Allow requests from Capacitor iOS/Android apps and web origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:5173',
  ];
  if (!origin || allowed.some(o => origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Framework system prompts ──────────────────────────────────

const SYSTEM_PROMPTS = {
  jungian: `You are a Jungian dream analyst with deep expertise in analytical psychology. Interpret dreams through Carl Jung's framework: archetypes (Hero, Shadow, Anima/Animus, Self, Wise Old Man/Woman, Trickster), the collective unconscious, individuation, compensation, and synchronicity. Every image in a dream is a symbol deserving attention — symbols carry both personal and universal (archetypal) meaning. The dreamer's ego is in dialogue with deeper layers of the psyche. Notice recurring motifs; they are the psyche insisting on being heard.

Tone: thoughtful, layered, introspective. Never reductive. Honor the mystery while illuminating it. Speak as a deeply knowledgeable analyst, not as a machine. Do not use AI language ("based on your dream," "I can help you"). Write as if composing a letter to a thoughtful friend who has shared something intimate.`,

  cognitive: `You are a cognitive dream scientist who interprets dreams through the lens of modern neuroscience and cognitive psychology. Your framework draws on: memory consolidation (hippocampal-neocortical dialogue during REM), threat simulation theory (Revonsuo), emotional processing and memory integration (Cartwright, Walker), the continuity hypothesis (Hall), default mode network activity, and predictive processing. Dreams are the brain doing meaningful work — consolidating memory, rehearsing social scenarios, regulating emotion.

Tone: clear, evidence-based, and practical. Intellectually rigorous but never cold. Help the dreamer understand what their brain may be doing, and why that matters for their waking life. Ground every observation in cognitive science. Write with warmth — understanding the mechanics of a dream can be deeply reassuring.`,

  spiritual: `You are a scholar of cross-cultural dream interpretation with expertise in: Greco-Roman oneiromancy (Artemidorus, Macrobius), Hindu Svapna Shastra, Islamic dream interpretation (Ibn Sirin, Al-Nabulsi), Indigenous dreamwork traditions from multiple cultures, and the Biblical/Kabbalistic traditions of prophetic dreaming. You hold all these traditions with equal reverence, drawing on whichever speaks most powerfully to the symbols at hand.

Tone: reverent, narrative, mythic. You help the dreamer see their dream in the context of humanity's oldest wisdom. Not fortune-telling — this is about the soul's communication with something larger than the waking self. Speak with gravitas and wonder.`,
};

// ── Tool definition — forces structured output, no JSON parsing issues ──

const INTERPRETATION_TOOL = {
  name: 'record_interpretation',
  description: 'Record the completed dream interpretation in structured form.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short, evocative title for this dream. 3–7 words, poetic, not a full sentence. Example: "The Library of Open Doors".',
      },
      overview: {
        type: 'string',
        description: '1–2 sentence thematic summary — the heart of this dream.',
      },
      symbols: {
        type: 'array',
        description: '2–4 key symbols from the dream.',
        items: {
          type: 'object',
          properties: {
            name:    { type: 'string', description: 'Name of the symbol.' },
            meaning: { type: 'string', description: 'What this symbol means in this framework, 1–2 sentences.' },
          },
          required: ['name', 'meaning'],
        },
      },
      emotionalLandscape: {
        type: 'string',
        description: '2–3 sentences on what the emotional texture of the dream reveals.',
      },
      wakingLife: {
        type: 'string',
        description: '2–3 sentences connecting this dream to the dreamer\'s likely waking circumstances. Speak in possibilities, not certainties.',
      },
      reflectionPrompts: {
        type: 'array',
        description: '2–3 open-ended reflection questions for the dreamer to sit with.',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 3,
      },
    },
    required: ['title', 'overview', 'symbols', 'emotionalLandscape', 'wakingLife', 'reflectionPrompts'],
  },
};

function buildPrompt(dream, recentDreams) {
  const context = recentDreams?.length > 0
    ? `\n\nFor context, the dreamer's recent dreams:\n${recentDreams.map((d, i) => `${i + 1}. "${d.title}" — ${d.body?.slice(0, 100)}...`).join('\n')}`
    : '';

  const moods = dream.moods?.length > 0
    ? `\nEmotional state on waking: ${dream.moods.join(', ')}`
    : '';

  return `Dream entry:\n\n${dream.body}${moods}${context}\n\nInterpret this dream thoroughly, then call record_interpretation with your analysis.`;
}

// ── API route ─────────────────────────────────────────────────

app.post('/api/interpret', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const { framework, dream, recentDreams = [] } = req.body;

  if (!framework || !dream?.body) {
    return res.status(400).json({ error: 'Missing framework or dream body.' });
  }

  const systemPrompt = SYSTEM_PROMPTS[framework];
  if (!systemPrompt) {
    return res.status(400).json({ error: `Unknown framework: ${framework}` });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      system: systemPrompt,
      tools: [INTERPRETATION_TOOL],
      tool_choice: { type: 'tool', name: 'record_interpretation' },
      messages: [{ role: 'user', content: buildPrompt(dream, recentDreams) }],
    });

    const toolBlock = message.content.find(b => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Model did not return a structured interpretation.');
    }

    res.json(toolBlock.input);
  } catch (err) {
    console.error('Interpretation error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Interpretation failed.' });
  }
});

// ── Privacy Policy ────────────────────────────────────────────

app.get('/privacy', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Privacy Policy · Noctua</title>
  <style>
    :root { --gold: #c9a866; --bg: #000; --text: #e8e0d0; --soft: #9b9386; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Georgia', serif;
           line-height: 1.7; padding: 48px 24px 80px; max-width: 680px; margin: 0 auto; }
    header { border-bottom: 1px solid #2a2820; padding-bottom: 24px; margin-bottom: 40px; }
    .wordmark { font-family: monospace; font-size: 11px; letter-spacing: 4px;
                color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 400; font-style: italic; }
    .meta { font-family: monospace; font-size: 10px; letter-spacing: 2px;
            color: var(--soft); margin-top: 8px; }
    h2 { font-family: monospace; font-size: 10px; letter-spacing: 2.5px; color: var(--gold);
         text-transform: uppercase; margin: 36px 0 12px; }
    p { color: #b8b0a0; margin-bottom: 16px; font-size: 15px; }
    ul { color: #b8b0a0; padding-left: 20px; margin-bottom: 16px; font-size: 15px; }
    li { margin-bottom: 8px; }
    a { color: var(--gold); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .rule { height: 1px; background: #2a2820; margin: 8px 0; }
  </style>
</head>
<body>
  <header>
    <div class="wordmark">Noctua</div>
    <h1>Privacy Policy</h1>
    <div class="meta">EFFECTIVE DATE · JUNE 1, 2025</div>
  </header>

  <h2>I · Overview</h2>
  <p>Noctua is a dream journal. Your dreams are yours. We designed Noctua with a strong bias toward local storage and minimal data collection. This policy explains exactly what we collect, what we don't, and why.</p>

  <h2>II · What We Collect</h2>
  <p><strong>Your dream entries are stored locally on your device.</strong> We do not upload, sync, or store your dream text, moods, or titles on any server unless you explicitly use a feature that requires it (such as AI interpretation).</p>
  <p>When you request an AI interpretation, the text of the relevant dream entry is transmitted to our server at <code>noctua.up.railway.app</code> and then to Anthropic's Claude API to generate your interpretation. We do not store this text after the response is returned. We do not use your dream content to train any AI model.</p>
  <p>We collect:</p>
  <ul>
    <li>Dream text sent for interpretation (not stored after response)</li>
    <li>Purchase and subscription status (managed by RevenueCat — see below)</li>
    <li>Anonymous usage events if you opt in (not currently implemented)</li>
  </ul>

  <h2>III · What We Do Not Collect</h2>
  <ul>
    <li>Your name, email address, or account credentials</li>
    <li>Your location</li>
    <li>Your contacts, camera, or microphone (unless you use the voice recording feature, which processes audio locally)</li>
    <li>Health or biometric data</li>
    <li>Advertising identifiers</li>
  </ul>

  <h2>IV · Voice Recording</h2>
  <p>If you use the voice recording feature to capture a dream, audio is processed locally on your device using the Web Speech API or native speech recognition. Audio is not transmitted to our servers. The resulting text transcript is stored locally on your device.</p>

  <h2>V · Subscriptions &amp; Purchases</h2>
  <p>Subscription and purchase management is handled by RevenueCat (revenuecat.com). RevenueCat may collect certain device identifiers and purchase history to manage your subscription. Please review <a href="https://www.revenuecat.com/privacy" target="_blank">RevenueCat's privacy policy</a> for details. Noctua does not receive or store your payment information.</p>

  <h2>VI · AI Interpretation</h2>
  <p>Interpretations are generated by Anthropic's Claude API. Your dream text is sent to Anthropic solely to generate the interpretation. Anthropic's use of API data is governed by their <a href="https://www.anthropic.com/legal/privacy" target="_blank">privacy policy</a> and API usage policy — Anthropic does not use API inputs to train models by default.</p>

  <h2>VII · Local Notifications</h2>
  <p>If you enable morning reminders, Noctua schedules local notifications entirely on your device. No data is transmitted to our servers for this purpose.</p>

  <h2>VIII · Third-Party Services</h2>
  <ul>
    <li><strong>Anthropic Claude API</strong> — AI interpretation. <a href="https://www.anthropic.com/legal/privacy">Privacy policy</a></li>
    <li><strong>RevenueCat</strong> — Subscription management. <a href="https://www.revenuecat.com/privacy">Privacy policy</a></li>
    <li><strong>Railway</strong> — Server hosting. <a href="https://railway.app/legal/privacy">Privacy policy</a></li>
  </ul>

  <h2>IX · Data Deletion</h2>
  <p>Because we do not maintain an account system or cloud storage for your dream entries, you can delete all local data at any time by deleting the app from your device. If you have an active subscription managed by RevenueCat, you may also contact us to request deletion of any RevenueCat-associated data.</p>

  <h2>X · Children</h2>
  <p>Noctua is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

  <h2>XI · Changes to This Policy</h2>
  <p>We may update this policy. When we do, we will update the effective date above. Continued use of Noctua after changes constitutes acceptance of the updated policy.</p>

  <h2>XII · Contact</h2>
  <p>Questions or requests: <a href="mailto:privacy@noctua.app">privacy@noctua.app</a></p>

  <div class="rule" style="margin-top: 48px;"></div>
  <p style="font-family: monospace; font-size: 9px; letter-spacing: 2px; color: #4a4840; margin-top: 16px;">
    NOCTUA · DREAM JOURNAL · noctua.up.railway.app/privacy
  </p>
</body>
</html>`);
});

// ── Terms of Use ──────────────────────────────────────────────

app.get('/terms', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Terms of Use · Noctua</title>
  <style>
    :root { --gold: #c9a866; --bg: #000; --text: #e8e0d0; --soft: #9b9386; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Georgia', serif;
           line-height: 1.7; padding: 48px 24px 80px; max-width: 680px; margin: 0 auto; }
    header { border-bottom: 1px solid #2a2820; padding-bottom: 24px; margin-bottom: 40px; }
    .wordmark { font-family: monospace; font-size: 11px; letter-spacing: 4px;
                color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 400; font-style: italic; }
    .meta { font-family: monospace; font-size: 10px; letter-spacing: 2px;
            color: var(--soft); margin-top: 8px; }
    h2 { font-family: monospace; font-size: 10px; letter-spacing: 2.5px; color: var(--gold);
         text-transform: uppercase; margin: 36px 0 12px; }
    p { color: #b8b0a0; margin-bottom: 16px; font-size: 15px; }
    ul { color: #b8b0a0; padding-left: 20px; margin-bottom: 16px; font-size: 15px; }
    li { margin-bottom: 8px; }
    a { color: var(--gold); text-decoration: none; }
    .rule { height: 1px; background: #2a2820; margin: 8px 0; }
  </style>
</head>
<body>
  <header>
    <div class="wordmark">Noctua</div>
    <h1>Terms of Use</h1>
    <div class="meta">EFFECTIVE DATE · JUNE 1, 2025</div>
  </header>

  <h2>I · Acceptance</h2>
  <p>By downloading or using Noctua, you agree to these Terms. If you do not agree, do not use the app.</p>

  <h2>II · The Service</h2>
  <p>Noctua is a dream journaling app with AI-powered interpretation. The free tier includes 3 interpretations per month. The Explorer subscription (Noctua Pro entitlement) provides unlimited interpretations.</p>

  <h2>III · Subscriptions</h2>
  <p>Subscriptions are billed through the App Store or Google Play and managed by RevenueCat. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. You can manage or cancel subscriptions in your device's account settings.</p>
  <ul>
    <li><strong>Monthly</strong> — $6.99/month</li>
    <li><strong>Annual</strong> — $59.99/year (~$5/month)</li>
    <li><strong>Lifetime</strong> — $149.99 one-time</li>
  </ul>

  <h2>IV · AI Interpretations</h2>
  <p>Interpretations are generated by AI and are provided for reflective and entertainment purposes only. They do not constitute psychological, medical, or therapeutic advice. Do not make significant life decisions based solely on AI-generated content.</p>

  <h2>V · Your Content</h2>
  <p>You retain all rights to your dream entries. By submitting a dream for interpretation, you grant Noctua a limited, temporary license to transmit that content to the AI service solely for the purpose of generating your interpretation.</p>

  <h2>VI · Prohibited Use</h2>
  <p>You agree not to: reverse engineer the app, use automated tools to extract interpretations at scale, or submit content that is unlawful or harmful.</p>

  <h2>VII · Disclaimers</h2>
  <p>Noctua is provided "as is" without warranty. We do not guarantee uninterrupted service or the accuracy of AI interpretations.</p>

  <h2>VIII · Contact</h2>
  <p>Questions: <a href="mailto:support@noctua.app">support@noctua.app</a></p>

  <div class="rule" style="margin-top: 48px;"></div>
  <p style="font-family: monospace; font-size: 9px; letter-spacing: 2px; color: #4a4840; margin-top: 16px;">
    NOCTUA · DREAM JOURNAL · noctua.up.railway.app/terms
  </p>
</body>
</html>`);
});

// ── Serve frontend in production ──────────────────────────────

const distPath = join(__dirname, 'dist');
const { existsSync } = await import('fs');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Noctua server running on port ${PORT}`);
});
