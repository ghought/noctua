import { D, FRAMEWORK_META } from '../design';
import { useStore, countThisMonth, dominantFramework } from '../store';
import { TabBar } from '../components/TabBar';
import { FrameBox } from '../components/FrameBox';
import type { Screen, SymbolRecord } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

// Deterministic pseudo-random using a seed
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface StarDot {
  x: number;
  y: number;
  r: number;
}

export function Charts({ navigate }: Props) {
  const { dreams, symbols } = useStore();

  const monthCount = countThisMonth(dreams);
  const domFw = dominantFramework(dreams);
  const totalDreams = dreams.length;

  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'long' }).toUpperCase();

  // Top symbols for star map (up to 8)
  const starSymbols = symbols.slice(0, 8);

  // Generate star positions (deterministic)
  const starPositions: { x: number; y: number; mag: number }[] = starSymbols.map((_, i) => ({
    x: 0.1 + seededRandom(i * 7 + 1) * 0.8,
    y: 0.1 + seededRandom(i * 7 + 2) * 0.75,
    mag: 1.0 + (starSymbols.length - i) * 0.4,
  }));

  // Dust (background stars) — deterministic
  const dust: StarDot[] = Array.from({ length: 50 }, (_, i) => ({
    x: seededRandom(i * 13 + 5),
    y: seededRandom(i * 13 + 6),
    r: seededRandom(i * 13 + 7) * 0.6 + 0.2,
  }));

  const topSymbols: SymbolRecord[] = symbols.slice(0, 5);

  const hasData = dreams.length > 0;

  return (
    <div style={{
      background: D.bg,
      minHeight: '100dvh',
      fontFamily: D.sans,
      color: D.text,
      paddingBottom: 90,
    }}>
      {/* Top */}
      <div style={{ padding: '56px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>NOCTUA · CHARTS</div>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim }}>30D</div>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 1.5, color: D.gold }}>
          {monthLabel} · {now.getFullYear()}
        </div>
        <div style={{
          fontFamily: D.slab,
          fontSize: 36,
          fontWeight: 400,
          color: D.text,
          lineHeight: 1,
          marginTop: 6,
          letterSpacing: -0.5,
        }}>
          A chart of<br />
          <span style={{ fontStyle: 'italic', color: D.gold }}>your night sky.</span>
        </div>
      </div>

      {!hasData ? (
        <div style={{ padding: '48px 22px', textAlign: 'center' }}>
          <div style={{
            fontFamily: D.slab,
            fontSize: 16,
            fontStyle: 'italic',
            color: D.textDim,
            lineHeight: 1.6,
          }}>
            Log and interpret dreams to see<br />your symbol charts emerge.
          </div>
          <button
            onClick={() => navigate({ name: 'capture' })}
            style={{
              marginTop: 24,
              padding: '10px 24px',
              background: D.gold,
              color: D.bg,
              fontFamily: D.mono,
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            BEGIN ENTRY →
          </button>
        </div>
      ) : (
        <>
          {/* Star map */}
          <div style={{ margin: '20px 18px 0' }}>
            <FrameBox label="SYMBOL CARTOGRAPHY" accent={D.silver}>
              <div style={{ position: 'relative', width: '100%', height: 250 }}>
                <svg width="100%" height="250" viewBox="0 0 280 250" style={{ overflow: 'visible' }}>
                  {/* Axes */}
                  <line x1="0" y1="240" x2="280" y2="240" stroke={D.rule} strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="240" stroke={D.rule} strokeWidth="0.5" />
                  {/* Grid */}
                  {[60, 120, 180].map(y => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke={D.ruleSoft} strokeWidth="0.5" strokeDasharray="2 4" />
                  ))}
                  {[70, 140, 210].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="240" stroke={D.ruleSoft} strokeWidth="0.5" strokeDasharray="2 4" />
                  ))}
                  {/* Dust */}
                  {dust.map((d, i) => (
                    <circle key={i} cx={d.x * 280} cy={d.y * 240} r={d.r} fill={D.textDim} opacity="0.5" />
                  ))}
                  {/* Constellation lines between top 3 stars */}
                  {starPositions.length > 2 && (
                    <>
                      <line
                        x1={starPositions[0].x * 280} y1={starPositions[0].y * 240}
                        x2={starPositions[1].x * 280} y2={starPositions[1].y * 240}
                        stroke={starSymbols[0]?.color ?? D.amethyst} strokeWidth="0.4" opacity="0.5"
                      />
                      <line
                        x1={starPositions[1].x * 280} y1={starPositions[1].y * 240}
                        x2={starPositions[2].x * 280} y2={starPositions[2].y * 240}
                        stroke={starSymbols[1]?.color ?? D.gold} strokeWidth="0.4" opacity="0.5"
                      />
                    </>
                  )}
                  {/* Stars */}
                  {starSymbols.map((sym, i) => {
                    const p = starPositions[i];
                    if (!p) return null;
                    const isTop = i === 0;
                    return (
                      <g key={i}>
                        {isTop && (
                          <circle cx={p.x * 280} cy={p.y * 240} r={p.mag * 4} fill={sym.color} opacity="0.15" />
                        )}
                        <circle cx={p.x * 280} cy={p.y * 240} r={p.mag} fill={sym.color} />
                        <circle cx={p.x * 280} cy={p.y * 240} r={p.mag * 0.4} fill={D.text} />
                        <text
                          x={p.x * 280 + p.mag + 5}
                          y={p.y * 240 + 3}
                          fontFamily="JetBrains Mono, monospace"
                          fontSize="8"
                          fill={sym.color}
                          letterSpacing="0.8"
                        >
                          {sym.name.toUpperCase().slice(0, 10)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{
                  position: 'absolute', left: -2, top: 0,
                  fontFamily: D.mono, fontSize: 8, color: D.textDim,
                  letterSpacing: 1.5,
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'top left',
                  whiteSpace: 'nowrap',
                  marginTop: 60,
                }}>
                  ← FREQ.
                </div>
                <div style={{
                  position: 'absolute', right: 0, bottom: -14,
                  fontFamily: D.mono, fontSize: 8, color: D.textDim, letterSpacing: 1.5,
                }}>
                  NOVELTY →
                </div>
              </div>
            </FrameBox>
          </div>

          {/* Stats */}
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 8 }}>
              THIS MONTH
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, padding: 14, border: `1px solid ${D.rule}` }}>
                <div style={{ fontFamily: D.mono, fontSize: 9, color: D.textDim, letterSpacing: 1.5 }}>NIGHTS</div>
                <div style={{ fontFamily: D.slab, fontSize: 28, color: D.gold, marginTop: 4 }}>{monthCount}</div>
              </div>
              <div style={{ flex: 1, padding: 14, border: `1px solid ${D.rule}` }}>
                <div style={{ fontFamily: D.mono, fontSize: 9, color: D.textDim, letterSpacing: 1.5 }}>TOTAL</div>
                <div style={{ fontFamily: D.slab, fontSize: 28, color: D.text, marginTop: 4 }}>{totalDreams}</div>
              </div>
              {domFw && (
                <div style={{ flex: 1, padding: 14, border: `1px solid ${D.rule}` }}>
                  <div style={{ fontFamily: D.mono, fontSize: 9, color: D.textDim, letterSpacing: 1.5 }}>DOMINANT</div>
                  <div style={{
                    fontFamily: D.mono,
                    fontSize: 16,
                    color: FRAMEWORK_META[domFw.key].color,
                    marginTop: 4,
                    letterSpacing: 1,
                  }}>
                    {FRAMEWORK_META[domFw.key].short}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frequency table */}
          {topSymbols.length > 0 && (
            <div style={{ padding: '0 22px' }}>
              <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 12 }}>
                FREQUENCY TABLE
              </div>
              {topSymbols.map((sym, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${D.ruleSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: sym.color, flexShrink: 0 }} />
                    <span style={{
                      fontFamily: D.slab, fontSize: 16, fontStyle: 'italic',
                      color: D.text, flex: 1, letterSpacing: -0.2,
                    }}>
                      {sym.name}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: 11, color: sym.color }}>
                      {sym.count}/{totalDreams}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                    {Array.from({ length: Math.min(totalDreams, 12) }).map((_, j) => (
                      <div
                        key={j}
                        style={{
                          flex: 1,
                          height: 3,
                          background: j < sym.count ? sym.color : D.ruleSoft,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Monthly reading */}
          {dreams.some(d => d.interpretations.length > 0) && (
            <div style={{ margin: '24px 18px 0' }}>
              <FrameBox label={`${monthLabel}'S READING`} accent={D.gold}>
                <div style={{
                  fontFamily: D.slab,
                  fontSize: 17,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: D.text,
                  lineHeight: 1.4,
                }}>
                  {topSymbols.length > 0
                    ? `Your dreams are returning to ${topSymbols[0].name.toLowerCase()} — and to the questions it carries with it.`
                    : 'Your archive is growing. Patterns will emerge with time.'}
                </div>
                <button
                  onClick={() => navigate({ name: 'index' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: D.mono,
                    fontSize: 10,
                    color: D.gold,
                    letterSpacing: 2,
                    marginTop: 14,
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  OPEN SYMBOL INDEX →
                </button>
              </FrameBox>
            </div>
          )}
        </>
      )}

      <TabBar active="charts" navigate={navigate} />
    </div>
  );
}
