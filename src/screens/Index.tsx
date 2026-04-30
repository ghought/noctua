import { useState } from 'react';
import { D, primaryButton, smallTextButton, tapBase } from '../design';
import { useStore } from '../store';
import { TabBar } from '../components/TabBar';
import type { Screen, SymbolRecord } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface LetterGroup {
  letter: string;
  symbols: SymbolRecord[];
}

export function Index({ navigate }: Props) {
  const { symbols, dreams } = useStore();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? symbols.filter(s => s.name.toLowerCase().includes(query.toLowerCase().trim()))
    : symbols;

  // Group by first letter
  const groups: LetterGroup[] = [];
  for (const sym of filtered) {
    const letter = sym.name[0].toUpperCase();
    const existing = groups.find(g => g.letter === letter);
    if (existing) {
      existing.symbols.push(sym);
    } else {
      groups.push({ letter, symbols: [sym] });
    }
  }
  groups.sort((a, b) => a.letter.localeCompare(b.letter));

  const lettersWithEntries = new Set(symbols.map(s => s.name[0].toUpperCase()));

  return (
    <div style={{
      background: D.bg,
      minHeight: '100dvh',
      fontFamily: D.sans,
      color: D.text,
      paddingBottom: 90,
    }}>
      {/* Top */}
      <div style={{ padding: '48px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>NOCTUA · INDEX</div>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim }}>
          {symbols.length} {symbols.length === 1 ? 'ENTRY' : 'ENTRIES'}
        </div>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 1.5, color: D.gold }}>YOUR PRIVATE</div>
        <div style={{
          fontFamily: D.slab,
          fontSize: 40,
          fontWeight: 400,
          color: D.text,
          lineHeight: 1,
          marginTop: 6,
          letterSpacing: -0.5,
        }}>
          <span style={{ fontStyle: 'italic' }}>Index</span><br />
          of Symbols.
        </div>
        <div style={{
          fontFamily: D.slab,
          fontSize: 14,
          fontStyle: 'italic',
          color: D.textSoft,
          marginTop: 14,
          lineHeight: 1.5,
        }}>
          What symbols mean to you, drawn only from your own dreams.
        </div>
      </div>

      {/* Search */}
      <div style={{
        margin: '20px 22px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        border: `1px solid ${D.rule}`,
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke={D.textDim} strokeWidth="1.2" />
          <path d="M11 11l3 3" stroke={D.textDim} strokeWidth="1.2" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search the Index"
          style={{
            flex: 1,
            fontFamily: D.mono,
            fontSize: 11,
            color: D.textSoft,
            letterSpacing: 1,
            textTransform: 'uppercase',
            background: 'none',
            border: 'none',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              ...smallTextButton(D.textDim),
              minHeight: 36,
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Alphabet rail */}
      {!query && (
        <div style={{ display: 'flex', gap: 2, padding: '14px 22px 0', flexWrap: 'wrap' }}>
          {ALPHABET.map(L => {
            const has = lettersWithEntries.has(L);
            return (
              <div
                key={L}
                style={{
                  width: 18,
                  textAlign: 'center',
                  fontFamily: D.mono,
                  fontSize: 10,
                  color: has ? D.gold : D.textDim,
                  fontWeight: has ? 600 : 400,
                  letterSpacing: 0.5,
                }}
              >
                {L}
              </div>
            );
          })}
        </div>
      )}

      {/* Index */}
      {symbols.length === 0 ? (
        <div style={{ padding: '48px 22px', textAlign: 'center' }}>
          <div style={{
            fontFamily: D.slab,
            fontSize: 16,
            fontStyle: 'italic',
            color: D.textDim,
            lineHeight: 1.6,
          }}>
            Your symbol index is empty.<br />Interpret dreams to build your lexicon.
          </div>
          <button
            onClick={() => navigate({ name: 'capture' })}
            style={{
              ...primaryButton(),
              marginTop: 24,
            }}
          >
            BEGIN ENTRY →
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div style={{ padding: '32px 22px', textAlign: 'center' }}>
          <div style={{ fontFamily: D.mono, fontSize: 11, color: D.textDim, letterSpacing: 1.5 }}>
            NO RESULTS
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 22px 0' }}>
          {groups.map(group => (
            <div key={group.letter} style={{ marginBottom: 18 }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: D.slab,
                  fontSize: 26,
                  fontStyle: 'italic',
                  color: D.gold,
                  fontWeight: 500,
                }}>
                  {group.letter}
                </span>
                <div style={{ flex: 1, height: 1, background: D.rule }} />
                <span style={{ fontFamily: D.mono, fontSize: 8, color: D.textDim, letterSpacing: 1.5 }}>
                  {group.symbols.length}
                </span>
              </div>

              {group.symbols.map((sym, i) => {
                const isNew = (() => {
                  const d = new Date(sym.firstSeen);
                  const now = new Date();
                  const diff = now.getTime() - d.getTime();
                  return diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
                })();

                return (
                  <button
                    key={i}
                    onClick={() => {
                      // Navigate to first dream this symbol appears in
                      if (sym.dreamIds.length > 0) {
                        navigate({ name: 'interpretation', dreamId: sym.dreamIds[0] });
                      }
                    }}
                    style={{
                      ...tapBase,
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '14px 0',
                      borderBottom: i < group.symbols.length - 1 ? `1px solid ${D.ruleSoft}` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: sym.color,
                        flexShrink: 0,
                        marginBottom: -1,
                      }} />
                      <span style={{
                        fontFamily: D.slab,
                        fontSize: 16,
                        fontStyle: 'italic',
                        color: D.text,
                        flex: 1,
                        letterSpacing: -0.2,
                      }}>
                        {sym.name}
                      </span>
                      {isNew && (
                        <span style={{
                          fontFamily: D.mono,
                          fontSize: 8,
                          color: D.gold,
                          letterSpacing: 1.5,
                          border: `1px solid ${D.gold}`,
                          padding: '1px 4px',
                          flexShrink: 0,
                        }}>
                          NEW
                        </span>
                      )}
                      <span style={{ fontFamily: D.mono, fontSize: 10, color: D.textDim }}>
                        ×{sym.count}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 12.5,
                      color: D.textSoft,
                      lineHeight: 1.45,
                      marginTop: 3,
                      fontStyle: 'italic',
                      paddingLeft: 14,
                    }}>
                      {sym.gloss}
                    </div>
                    <div style={{
                      fontFamily: D.mono,
                      fontSize: 8,
                      color: D.textDim,
                      letterSpacing: 1.5,
                      marginTop: 4,
                      paddingLeft: 14,
                    }}>
                      {sym.dreamIds.length} {sym.dreamIds.length === 1 ? 'DREAM' : 'DREAMS'} · {dreams.filter(d => sym.dreamIds.includes(d.id)).map(d => d.framework.toUpperCase().slice(0, 4)).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <TabBar active="index" navigate={navigate} />
    </div>
  );
}
