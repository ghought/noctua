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
