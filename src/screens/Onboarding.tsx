import { useState } from 'react';
import { D, FRAMEWORK_META, V1_FRAMEWORKS } from '../design';
import { useStore } from '../store';
import { FrameBox } from '../components/FrameBox';
import type { FrameworkKey } from '../design';

interface Props {
  onComplete: () => void;
}

type Step = 'welcome-1' | 'welcome-2' | 'welcome-3' | 'framework';

const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  jungian: 'Archetypes, the shadow, and the collective unconscious. Dreams as the psyche speaking its own language — layered, mythic, and pointing toward wholeness.',
  cognitive: 'Memory consolidation, emotional processing, threat simulation. Dreams as the brain doing meaningful work — grounded in neuroscience, practically illuminating.',
  spiritual: 'Cross-cultural dream wisdom — Greco-Roman, Hindu, Islamic, Indigenous, Biblical. Dreams as messages from something older and larger than the waking self.',
};

export function Onboarding({ onComplete }: Props) {
  const { updateSettings } = useStore();
  const [step, setStep] = useState<Step>('welcome-1');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>('jungian');

  const advance = (next: Step) => setStep(next);

  const finish = () => {
    updateSettings({
      defaultFramework: selectedFramework,
      onboarded: true,
    });
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: D.bg,
      fontFamily: D.sans,
      color: D.text,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Welcome 1 ── */}
      {step === 'welcome-1' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '44px 32px 32px',
          animation: 'fadeIn 0.5s ease',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', marginBottom: 48 }}>
            <svg width="120" height="80" viewBox="0 0 120 80" style={{ display: 'block' }}>
              {[
                { cx: 20, cy: 30, r: 2.5, color: D.amethyst },
                { cx: 60, cy: 15, r: 1.8, color: D.gold },
                { cx: 95, cy: 35, r: 1.2, color: D.sapphire },
                { cx: 40, cy: 60, r: 1.5, color: D.silver },
                { cx: 80, cy: 55, r: 0.8, color: D.emerald },
                { cx: 10, cy: 65, r: 0.6, color: D.textDim },
                { cx: 108, cy: 20, r: 0.6, color: D.textDim },
              ].map((s, i) => (
                <g key={i}>
                  <circle cx={s.cx} cy={s.cy} r={s.r * 3} fill={s.color} opacity="0.12" />
                  <circle cx={s.cx} cy={s.cy} r={s.r} fill={s.color} />
                </g>
              ))}
              <line x1="20" y1="30" x2="60" y2="15" stroke={D.amethyst} strokeWidth="0.4" opacity="0.4" />
              <line x1="60" y1="15" x2="95" y2="35" stroke={D.gold} strokeWidth="0.4" opacity="0.4" />
            </svg>
          </div>

          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 20 }}>
            NOCTUA
          </div>

          <div style={{
            fontFamily: D.slab,
            fontSize: 42,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: -0.5,
            marginBottom: 28,
          }}>
            Your dreams<br />
            are trying to<br />
            <span style={{ fontStyle: 'italic', color: D.gold }}>tell you something.</span>
          </div>

          <div style={{
            fontFamily: D.sans,
            fontSize: 15,
            color: D.textSoft,
            lineHeight: 1.7,
            marginBottom: 48,
          }}>
            Noctua is a dream journal and interpretation companion — rooted in psychology and cultural wisdom.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: D.rule }} />
            <div style={{ width: 4, height: 4, background: D.gold, transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, height: 1, background: D.rule }} />
          </div>

          <button
            onClick={() => advance('welcome-2')}
            style={{
              marginTop: 36,
              width: '100%',
              padding: '14px 0',
              background: D.gold,
              color: D.bg,
              fontFamily: D.mono,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ENTER THE ARCHIVE →
          </button>

          <div style={{ fontFamily: D.mono, fontSize: 8, color: D.textDim, letterSpacing: 1.5, marginTop: 16, textAlign: 'center' }}>
            YOUR DREAMS REMAIN PRIVATE · NEVER USED FOR TRAINING
          </div>
        </div>
      )}

      {/* ── Welcome 2 — How it works ── */}
      {step === 'welcome-2' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '44px 32px 32px',
          animation: 'fadeIn 0.4s ease',
          overflow: 'hidden',
        }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 24 }}>
            HOW IT WORKS
          </div>

          {[
            { n: '01', title: 'Log your dream', body: 'Capture what you remember — full narrative, fragments, or a single image. The texture of your memory matters.' },
            { n: '02', title: 'Choose your lens', body: 'Select an interpretation framework — Jungian, Cognitive, Spiritual, and more. Each reads the same dream differently.' },
            { n: '03', title: 'Receive an interpretation', body: 'A substantive, personalized reading drawn from your framework of choice. Not a dictionary — a genuine analysis.' },
            { n: '04', title: 'Watch patterns emerge', body: 'Over time, your archive reveals recurring symbols, emotional arcs, and what your dreaming mind keeps returning to.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: i < 3 ? `1px solid ${D.ruleSoft}` : 'none',
            }}>
              <div style={{
                fontFamily: D.mono,
                fontSize: 11,
                color: D.gold,
                letterSpacing: 1.5,
                flexShrink: 0,
                paddingTop: 2,
              }}>
                {item.n}
              </div>
              <div>
                <div style={{ fontFamily: D.slab, fontSize: 18, fontStyle: 'italic', color: D.text, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: D.textSoft, lineHeight: 1.6 }}>
                  {item.body}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => advance('welcome-3')}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '14px 0',
              background: D.gold,
              color: D.bg,
              fontFamily: D.mono,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CONTINUE →
          </button>
        </div>
      )}

      {/* ── Welcome 3 — Privacy ── */}
      {step === 'welcome-3' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '44px 32px 32px',
          animation: 'fadeIn 0.4s ease',
          overflow: 'hidden',
        }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 24 }}>
            YOUR PRIVACY
          </div>

          <div style={{
            fontFamily: D.slab,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: -0.3,
            marginBottom: 28,
          }}>
            Dreams are<br />
            <span style={{ fontStyle: 'italic', color: D.gold }}>intimate.</span>
          </div>

          <FrameBox accent={D.gold}>
            {[
              'Your dream content is never used to train AI models.',
              'Interpretations are generated in the moment and not stored on external servers.',
              'You can export or permanently delete your archive at any time.',
              'We do not sell, share, or analyze your dream data.',
            ].map((line, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                padding: '8px 0',
                borderBottom: i < 3 ? `1px solid ${D.ruleSoft}` : 'none',
              }}>
                <div style={{ width: 4, height: 4, background: D.gold, transform: 'rotate(45deg)', flexShrink: 0, marginTop: 6 }} />
                <div style={{ fontSize: 13, color: D.textSoft, lineHeight: 1.55 }}>{line}</div>
              </div>
            ))}
          </FrameBox>

          <button
            onClick={() => advance('framework')}
            style={{
              marginTop: 32,
              width: '100%',
              padding: '14px 0',
              background: D.gold,
              color: D.bg,
              fontFamily: D.mono,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CHOOSE MY FRAMEWORK →
          </button>
        </div>
      )}

      {/* ── Framework picker ── */}
      {step === 'framework' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '44px 22px 20px',
          animation: 'fadeIn 0.4s ease',
          overflow: 'hidden',
        }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 6 }}>
            YOUR LENS
          </div>
          <div style={{
            fontFamily: D.slab,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: -0.3,
            marginBottom: 6,
          }}>
            How would you like<br />
            <span style={{ fontStyle: 'italic', color: D.gold }}>your dreams read?</span>
          </div>
          <div style={{ fontSize: 12, color: D.textSoft, lineHeight: 1.5, marginBottom: 16 }}>
            You can switch frameworks at any time, or read the same dream through multiple lenses.
          </div>

          {V1_FRAMEWORKS.map(fw => {
            const meta = FRAMEWORK_META[fw];
            const selected = selectedFramework === fw;
            return (
              <button
                key={fw}
                onClick={() => setSelectedFramework(fw)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 8,
                  padding: 0,
                  border: `1px solid ${selected ? meta.color : D.rule}`,
                  background: selected ? `${meta.color}14` : 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: selected ? meta.color : D.textDim,
                      transition: 'background 0.15s',
                    }} />
                    <div style={{
                      fontFamily: D.mono, fontSize: 10, letterSpacing: 2,
                      color: selected ? meta.color : D.textDim, fontWeight: 600,
                    }}>
                      {meta.name.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: selected ? D.textSoft : D.textDim, lineHeight: 1.5 }}>
                    {FRAMEWORK_DESCRIPTIONS[fw]}
                  </div>
                </div>
              </button>
            );
          })}

          <div style={{ fontSize: 11, color: D.textDim, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.4, marginTop: 4 }}>
            More frameworks — Freudian, Gestalt, Existential — available in a future update.
          </div>

          <button
            onClick={finish}
            style={{
              width: '100%',
              padding: '13px 0',
              background: D.gold,
              color: D.bg,
              fontFamily: D.mono,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            BEGIN →
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingBottom: 32 }}>
        {(['welcome-1', 'welcome-2', 'welcome-3', 'framework'] as Step[]).map(s => (
          <div
            key={s}
            style={{
              width: step === s ? 16 : 4,
              height: 4,
              background: step === s ? D.gold : D.rule,
              transition: 'width 0.2s, background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
