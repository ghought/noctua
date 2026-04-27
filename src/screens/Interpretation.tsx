import { useState, useEffect } from 'react';
import { D, FRAMEWORK_META, V1_FRAMEWORKS } from '../design';
import { useStore, formatEntryDate } from '../store';
import { interpretDream } from '../api/interpret';
import { FrameBox } from '../components/FrameBox';
import type { Interpretation as InterpretationType, Screen } from '../types';
import type { FrameworkKey } from '../design';

interface Props {
  navigate: (s: Screen) => void;
  dreamId: string;
  initialFramework?: FrameworkKey;
}

export function Interpretation({ navigate, dreamId, initialFramework }: Props) {
  const { getDream, dreams, addInterpretation, updateDreamTitle } = useStore();
  const dream = getDream(dreamId);

  const [framework, setFramework] = useState<FrameworkKey>(
    initialFramework ?? dream?.framework ?? 'jungian'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interp: InterpretationType | undefined = dream?.interpretations.find(
    i => i.framework === framework
  );

  // Auto-generate if no interpretation exists for this framework
  useEffect(() => {
    if (!dream || interp || loading) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework, dream?.id]);

  const generate = async () => {
    if (!dream) return;
    setLoading(true);
    setError(null);
    try {
      const recent = dreams.filter(d => d.id !== dream.id).slice(0, 5);
      const { interpretation, title } = await interpretDream(dream, framework, recent);
      addInterpretation(dream.id, interpretation);
      // Update title on first interpretation (when title is still the placeholder)
      if (dream.title === '— recording —' || dream.title === '— fragment —') {
        updateDreamTitle(dream.id, title);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Interpretation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!dream) {
    return (
      <div style={{ background: D.bg, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: D.mono, fontSize: 11, color: D.textDim }}>Entry not found.</div>
      </div>
    );
  }

  const allFws = V1_FRAMEWORKS;
  const fwMeta = FRAMEWORK_META[framework];

  return (
    <div style={{ background: D.bg, minHeight: '100dvh', fontFamily: D.sans, color: D.text, paddingBottom: 40 }}>
      {/* Top */}
      <div style={{ padding: '56px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate({ name: 'archive' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim, padding: 0 }}
        >
          ← №{String(dream.entryNumber).padStart(4, '0')}
        </button>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>
          {interp ? `INTERPRETED · ${formatEntryDate(interp.generatedAt)}` : 'AWAITING INTERPRETATION'}
        </div>
        <button
          onClick={() => navigate({ name: 'capture', editId: dreamId })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim, padding: 0 }}
        >
          EDIT
        </button>
      </div>

      {/* Framework selector */}
      <div style={{ margin: '20px 22px 0', display: 'flex', gap: 0, border: `1px solid ${D.rule}` }}>
        {allFws.map((fw, i) => {
          const meta = FRAMEWORK_META[fw];
          const sel = framework === fw;
          const hasInterp = dream.interpretations.some(it => it.framework === fw);
          return (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 0',
                fontFamily: D.mono,
                fontSize: 9,
                letterSpacing: 1.5,
                background: sel ? meta.color : 'transparent',
                color: sel ? D.bg : hasInterp ? meta.color : D.textDim,
                fontWeight: 600,
                border: 'none',
                borderRight: i < allFws.length - 1 ? `1px solid ${D.rule}` : 'none',
                cursor: 'pointer',
              }}
            >
              {meta.short}
            </button>
          );
        })}
      </div>

      {/* Hero */}
      <div style={{ padding: '26px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: fwMeta.color, marginBottom: 8 }}>
          READ THROUGH {fwMeta.name.toUpperCase()}
        </div>
        <div style={{
          fontFamily: D.slab,
          fontSize: 30,
          fontWeight: 400,
          color: D.text,
          lineHeight: 1.1,
          letterSpacing: -0.5,
          fontStyle: 'italic',
        }}>
          <span style={{ color: D.gold }}>{dream.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <div style={{ flex: 1, height: 1, background: D.rule }} />
          <div style={{ width: 4, height: 4, background: D.gold, transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: D.rule }} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 22px', textAlign: 'center' }}>
          <div style={{
            fontFamily: D.slab,
            fontSize: 18,
            fontStyle: 'italic',
            color: D.textSoft,
            lineHeight: 1.6,
            animation: 'fadeIn 0.3s ease',
          }}>
            Consulting the archive…
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  background: D.gold,
                  transform: 'rotate(45deg)',
                  animation: `blink 1.4s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ margin: '24px 18px 0' }}>
          <FrameBox label="ERROR" accent={D.ruby}>
            <div style={{ fontFamily: D.sans, fontSize: 13, color: D.textSoft, lineHeight: 1.6 }}>
              {error}
            </div>
            <button
              onClick={generate}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '9px 0',
                textAlign: 'center',
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
              RETRY
            </button>
          </FrameBox>
        </div>
      )}


      {/* Interpretation content */}
      {interp && !loading && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* I · Overview */}
          <div style={{ padding: '20px 22px 0' }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
              I · OVERVIEW
            </div>
            <div style={{
              fontFamily: D.slab,
              fontSize: 17,
              fontWeight: 400,
              color: D.text,
              lineHeight: 1.55,
              fontStyle: 'italic',
            }}>
              {interp.overview}
            </div>
          </div>

          {/* II · Symbol Cartography */}
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 12 }}>
              II · SYMBOL CARTOGRAPHY
            </div>
            {interp.symbols.map((sym, i) => {
              const colors = [fwMeta.color, D.gold, D.sapphire, D.silver];
              const c = colors[i % colors.length];
              const roman = ['i', 'ii', 'iii', 'iv', 'v'][i] ?? String(i + 1);
              return (
                <div
                  key={i}
                  style={{
                    padding: '12px 0',
                    borderBottom: i < interp.symbols.length - 1 ? `1px solid ${D.ruleSoft}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{
                      fontFamily: D.mono,
                      fontSize: 9,
                      color: c,
                      letterSpacing: 1.5,
                      fontWeight: 600,
                      width: 22,
                    }}>
                      {roman}.
                    </span>
                    <span style={{
                      fontFamily: D.slab,
                      fontSize: 17,
                      fontWeight: 500,
                      color: D.text,
                      fontStyle: 'italic',
                      flex: 1,
                      letterSpacing: -0.2,
                    }}>
                      {sym.name}
                    </span>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: c, flexShrink: 0 }} />
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: D.textSoft,
                    lineHeight: 1.55,
                    paddingLeft: 32,
                    marginTop: 4,
                  }}>
                    {sym.meaning}
                  </div>
                </div>
              );
            })}
          </div>

          {/* III · Emotional Landscape */}
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
              III · EMOTIONAL LANDSCAPE
            </div>
            <div style={{
              fontSize: 14,
              color: D.textSoft,
              lineHeight: 1.6,
            }}>
              {interp.emotionalLandscape}
            </div>
          </div>

          {/* IV · Waking Life */}
          <div style={{ padding: '24px 22px 0' }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
              IV · CONNECTION TO WAKING LIFE
            </div>
            <div style={{
              fontSize: 14,
              color: D.textSoft,
              lineHeight: 1.6,
            }}>
              {interp.wakingLife}
            </div>
          </div>

          {/* V · Reflection Prompts */}
          <div style={{ margin: '24px 18px 0' }}>
            <FrameBox label="V · SIT WITH" accent={D.gold}>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {interp.reflectionPrompts.map((q, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '8px 0',
                      borderBottom: i < interp.reflectionPrompts.length - 1 ? `1px solid ${D.ruleSoft}` : 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: D.mono,
                      fontSize: 11,
                      color: D.gold,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontFamily: D.slab,
                      fontSize: 14,
                      fontStyle: 'italic',
                      color: D.text,
                      lineHeight: 1.55,
                      flex: 1,
                    }}>
                      {q}
                    </span>
                  </li>
                ))}
              </ol>
            </FrameBox>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, padding: '16px 18px 0' }}>
            <button
              onClick={generate}
              style={{
                flex: 1,
                padding: '11px 0',
                textAlign: 'center',
                border: `1px solid ${D.rule}`,
                color: D.textDim,
                fontFamily: D.mono,
                fontSize: 10,
                letterSpacing: 2,
                background: 'none',
                cursor: 'pointer',
              }}
            >
              REGENERATE
            </button>
            <button
              onClick={() => {
                const fw = V1_FRAMEWORKS.find(f => f !== framework);
                if (fw) setFramework(fw);
              }}
              style={{
                flex: 1,
                padding: '11px 0',
                textAlign: 'center',
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
              SWITCH LENS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
