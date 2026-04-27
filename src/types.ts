import type { FrameworkKey } from './design';

export type { FrameworkKey };

export interface DreamSymbol {
  name: string;
  meaning: string;
}

export interface Interpretation {
  framework: FrameworkKey;
  overview: string;
  symbols: DreamSymbol[];
  emotionalLandscape: string;
  wakingLife: string;
  reflectionPrompts: string[];
  generatedAt: string;
}

export interface DreamEntry {
  id: string;
  entryNumber: number;
  date: string;          // ISO string
  title: string;
  body: string;
  moods: string[];
  framework: FrameworkKey;
  isFragment: boolean;
  interpretations: Interpretation[];
}

export interface SymbolRecord {
  name: string;
  count: number;
  dreamIds: string[];
  gloss: string;          // Latest interpretation gloss
  color: string;
  firstSeen: string;
  lastSeen: string;
}

export interface Settings {
  defaultFramework: FrameworkKey;
  onboarded: boolean;
}

export type Screen =
  | { name: 'onboarding' }
  | { name: 'archive' }
  | { name: 'capture'; editId?: string }
  | { name: 'interpretation'; dreamId: string; framework?: FrameworkKey }
  | { name: 'charts' }
  | { name: 'index' }
  | { name: 'settings' };
