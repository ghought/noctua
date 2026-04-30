import { Capacitor } from '@capacitor/core';
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

interface TitleResponse {
  title: string;
  error?: string;
}

// On native, fetch() is patched by CapacitorHttp (capacitor.config.ts) to use
// native URLSession — no WebView CORS or ATS restrictions.
// On web, relative path works via Vite proxy (dev) or Express static serve (prod).
const API_BASE = Capacitor.isNativePlatform()
  ? (import.meta as any).env?.VITE_API_URL ?? 'https://noctua.up.railway.app'
  : '';

export async function interpretDream(
  dream: DreamEntry,
  framework: FrameworkKey,
  recentDreams: DreamEntry[] = [],
): Promise<{ interpretation: Interpretation; title: string }> {
  const url = `${API_BASE}/api/interpret`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        framework,
        dream: { body: dream.body, moods: dream.moods, title: dream.title },
        recentDreams: recentDreams.slice(0, 5).map(d => ({
          title: d.title,
          body: d.body.slice(0, 120),
        })),
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Network error — check your connection and try again. (${msg})`);
  }

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

export async function generateDreamTitle(
  dream: Pick<DreamEntry, 'body' | 'moods' | 'isFragment'>,
): Promise<string> {
  const url = `${API_BASE}/api/title`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dream: { body: dream.body, moods: dream.moods, isFragment: dream.isFragment },
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Network error — check your connection and try again. (${msg})`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Server error' })) as TitleResponse;
    throw new Error(body.error ?? `Server returned ${res.status}`);
  }

  const data = await res.json() as TitleResponse;
  if (data.error) throw new Error(data.error);
  return data.title;
}
