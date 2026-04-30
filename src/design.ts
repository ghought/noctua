// Variant D — Celestial Archive design tokens
import type { CSSProperties } from 'react';

export const D = {
  bg: '#000000',
  bg2: '#0a0a0c',
  surface: '#0f0f12',
  surfaceLight: '#1a1a1f',
  text: '#e8e6e0',
  textSoft: '#a8a59c',
  textDim: '#5d5a52',
  rule: '#3a3730',
  ruleSoft: '#1f1d18',
  gold: '#c9a866',
  goldDim: '#7a6438',
  silver: '#cdc9be',
  emerald: '#3a8f6a',
  sapphire: '#3b6ea8',
  amethyst: '#8a5fa3',
  ruby: '#a14758',
  mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  slab: '"Fraunces", "DM Serif Display", Georgia, serif',
  sans: '"Inter", -apple-system, system-ui, sans-serif',
} as const;

export const FRAMEWORK_META = {
  jungian:    { label: 'JUNG', short: 'JUNG', color: '#8a5fa3', name: 'Jungian' },
  cognitive:  { label: 'COG',  short: 'COG',  color: '#3a8f6a', name: 'Cognitive' },
  spiritual:  { label: 'MYTH', short: 'MYTH', color: '#c9a866', name: 'Spiritual / Mythological' },
  freudian:   { label: 'FREUD',short: 'FREUD',color: '#a14758', name: 'Freudian' },
  gestalt:    { label: 'GEST', short: 'GEST', color: '#3b6ea8', name: 'Gestalt' },
  existential:{ label: 'EXI',  short: 'EXI',  color: '#cdc9be', name: 'Existential' },
} as const;

export type FrameworkKey = keyof typeof FRAMEWORK_META;

export const V1_FRAMEWORKS: FrameworkKey[] = ['jungian', 'cognitive', 'spiritual'];

export const GLYPH_MAP = ['◉', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◌', '◯'];

export function dreamGlyph(id: string): string {
  const n = parseInt(id.slice(-4), 16) % GLYPH_MAP.length;
  return GLYPH_MAP[n];
}

export const tapBase: CSSProperties = {
  minHeight: 44,
  minWidth: 44,
  touchAction: 'manipulation',
};

export function smallTextButton(color: string = D.textDim): CSSProperties {
  return {
    ...tapBase,
    background: 'transparent',
    border: `1px solid ${D.ruleSoft}`,
    cursor: 'pointer',
    fontFamily: D.mono,
    fontSize: 10,
    letterSpacing: 1.7,
    color,
    padding: '0 12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  };
}

export function primaryButton(disabled = false): CSSProperties {
  return {
    ...tapBase,
    width: '100%',
    padding: '0 16px',
    background: disabled ? D.rule : D.gold,
    color: disabled ? D.textDim : D.bg,
    fontFamily: D.mono,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 700,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  };
}

export function iconButtonStyle(size = 44, color: string = D.textDim): CSSProperties {
  return {
    ...tapBase,
    width: size,
    height: size,
    padding: 0,
    background: 'transparent',
    border: `1px solid ${D.ruleSoft}`,
    cursor: 'pointer',
    color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
