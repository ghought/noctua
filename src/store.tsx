import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DreamEntry, Interpretation, Settings, SymbolRecord } from './types';
import type { FrameworkKey } from './design';
import { FRAMEWORK_META } from './design';

// ── Storage keys ──────────────────────────────────────────────
const KEY_DREAMS   = 'noctua_dreams';
const KEY_SETTINGS = 'noctua_settings';
const KEY_SYMBOLS  = 'noctua_symbols';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ── Default settings ──────────────────────────────────────────
const defaultSettings: Settings = {
  defaultFramework: 'jungian',
  onboarded: false,
};

// ── Context ───────────────────────────────────────────────────
interface StoreCtx {
  dreams: DreamEntry[];
  settings: Settings;
  symbols: SymbolRecord[];

  saveDream: (dream: DreamEntry) => void;
  deleteDream: (id: string) => void;
  addInterpretation: (dreamId: string, interp: Interpretation) => void;
  updateDreamTitle: (dreamId: string, title: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  getDream: (id: string) => DreamEntry | undefined;
  nextEntryNumber: () => number;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [dreams, setDreams] = useState<DreamEntry[]>(() =>
    load<DreamEntry[]>(KEY_DREAMS, [])
  );
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>(KEY_SETTINGS, defaultSettings)
  );
  const [symbols, setSymbols] = useState<SymbolRecord[]>(() =>
    load<SymbolRecord[]>(KEY_SYMBOLS, [])
  );

  const saveDream = useCallback((dream: DreamEntry) => {
    setDreams(prev => {
      const idx = prev.findIndex(d => d.id === dream.id);
      const next = idx >= 0
        ? prev.map(d => d.id === dream.id ? dream : d)
        : [dream, ...prev];
      save(KEY_DREAMS, next);
      return next;
    });
  }, []);

  const deleteDream = useCallback((id: string) => {
    setDreams(prev => {
      const next = prev.filter(d => d.id !== id);
      save(KEY_DREAMS, next);
      return next;
    });
  }, []);

  const addInterpretation = useCallback((dreamId: string, interp: Interpretation) => {
    setDreams(prev => {
      const next = prev.map(d => {
        if (d.id !== dreamId) return d;
        const filtered = d.interpretations.filter(i => i.framework !== interp.framework);
        return { ...d, interpretations: [...filtered, interp] };
      });
      save(KEY_DREAMS, next);
      return next;
    });

    // Update symbol index
    setSymbols(prev => {
      const updated = [...prev];
      for (const sym of interp.symbols) {
        const name = sym.name.toLowerCase();
        const fwColor = FRAMEWORK_META[interp.framework].color;
        const existing = updated.findIndex(s => s.name.toLowerCase() === name);
        if (existing >= 0) {
          const s = updated[existing];
          updated[existing] = {
            ...s,
            count: s.count + 1,
            dreamIds: s.dreamIds.includes(dreamId) ? s.dreamIds : [...s.dreamIds, dreamId],
            gloss: sym.meaning,
            lastSeen: new Date().toISOString(),
          };
        } else {
          updated.push({
            name: sym.name,
            count: 1,
            dreamIds: [dreamId],
            gloss: sym.meaning,
            color: fwColor,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          });
        }
      }
      const sorted = [...updated].sort((a, b) => b.count - a.count);
      save(KEY_SYMBOLS, sorted);
      return sorted;
    });
  }, []);

  const updateDreamTitle = useCallback((dreamId: string, title: string) => {
    setDreams(prev => {
      const next = prev.map(d => d.id === dreamId ? { ...d, title } : d);
      save(KEY_DREAMS, next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      save(KEY_SETTINGS, next);
      return next;
    });
  }, []);

  const getDream = useCallback((id: string) =>
    dreams.find(d => d.id === id), [dreams]);

  const nextEntryNumber = useCallback(() => {
    if (dreams.length === 0) return 1;
    return Math.max(...dreams.map(d => d.entryNumber)) + 1;
  }, [dreams]);

  return (
    <Ctx.Provider value={{
      dreams, settings, symbols,
      saveDream, deleteDream, addInterpretation, updateDreamTitle,
      updateSettings, getDream, nextEntryNumber,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────
export function newDreamId(): string {
  return Date.now().toString(16) + Math.random().toString(16).slice(2, 6);
}

export function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(2);
  return `${day}·${month}·${year}`;
}

export function formatEntryDateFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function countThisMonth(dreams: DreamEntry[]): number {
  const now = new Date();
  return dreams.filter(d => {
    const dd = new Date(d.date);
    return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
  }).length;
}

export function dominantFramework(dreams: DreamEntry[]): { key: FrameworkKey; pct: number } | null {
  if (dreams.length === 0) return null;
  const counts: Partial<Record<FrameworkKey, number>> = {};
  for (const d of dreams) counts[d.framework] = (counts[d.framework] ?? 0) + 1;
  const [key, n] = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0] as [FrameworkKey, number];
  return { key, pct: Math.round((n / dreams.length) * 100) };
}
