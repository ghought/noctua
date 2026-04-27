import type { FrameworkKey } from '../design';
import type { DreamEntry, Interpretation } from '../types';

interface ServerResponse {
  title: string;
  overview: string;
  symbols: { name: string; meaning: string }[];
  emotionalLandscape: string;
  wakingLife: string;
  reflectionPrompts: string[];
  error?: string;
}

export async function interpretDream(
  dream: DreamEntry,
  framework: FrameworkKey,
  recentDreams: DreamEntry[] = [],
): Promise<{ interpretation: Interpretation; title: string }> {
  const res = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      framework,
      dream: {
        body: dream.body,
        moods: dream.moods,
        title: dream.title,
      },
      recentDreams: recentDreams.slice(0, 5).map(d => ({
        title: d.title,
        body: d.body.slice(0, 120),
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Server error' })) as ServerResponse;
    throw new Error(body.error ?? `Server returned ${res.status}`);
  }

  const data = await res.json() as ServerResponse;
  if (data.error) throw new Error(data.error);

  const interpretation: Interpretation = {
    framework,
    overview: data.overview,
    symbols: data.symbols,
    emotionalLandscape: data.emotionalLandscape,
    wakingLife: data.wakingLife,
    reflectionPrompts: data.reflectionPrompts,
    generatedAt: new Date().toISOString(),
  };

  return { interpretation, title: data.title };
}
