import { useState } from 'react';
import { D, FRAMEWORK_META, V1_FRAMEWORKS } from '../design';
import { useStore } from '../store';
import { HairlineRow } from '../components/HairlineRow';
import { FrameBox } from '../components/FrameBox';
import type { Screen } from '../types';
import type { FrameworkKey } from '../design';

interface Props {
  navigate: (s: Screen) => void;
}

export function Settings({ navigate }: Props) {
  const { settings, updateSettings, dreams, symbols } = useStore();
  const [showReset, setShowReset] = useState(false);

  const setFramework = (fw: FrameworkKey) => {
    updateSettings({ defaultFramework: fw });
  };

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      dreams,
      symbols,
      settings: { defaultFramework: settings.defaultFramework },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noctua-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{
      background: D.bg,
      minHeight: '100dvh',
      fontFamily: D.sans,
      color: D.text,
      paddingBottom: 60,
    }}>
      {/* Top */}
      <div style={{ padding: '56px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate({ name: 'archive' })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim, padding: 0,
          }}
        >
          ← ARCHIVE
        </button>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>
          NOCTUA · SETTINGS
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ fontFamily: D.slab, fontSize: 36, fontWeight: 400, lineHeight: 1, letterSpacing: -0.5 }}>
          Settings &amp;<br />
          <span style={{ fontStyle: 'italic', color: D.gold }}>Preferences.</span>
        </div>
      </div>

      {/* Archive stats */}
      <div style={{ padding: '28px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
          ARCHIVE
        </div>
        <HairlineRow label="TOTAL DREAMS" value={String(dreams.length)} />
        <HairlineRow label="SYMBOLS TRACKED" value={String(symbols.length)} />
        <HairlineRow label="INTERPRETATIONS" value={String(dreams.reduce((n, d) => n + d.interpretations.length, 0))} />
      </div>

      {/* Default framework */}
      <div style={{ padding: '28px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 12 }}>
          DEFAULT FRAMEWORK
        </div>
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${D.rule}` }}>
          {V1_FRAMEWORKS.map((fw, i) => {
            const meta = FRAMEWORK_META[fw];
            const sel = settings.defaultFramework === fw;
            return (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                style={{
                  flex: 1, textAlign: 'center', padding: '10px 0',
                  fontFamily: D.mono, fontSize: 9, letterSpacing: 1.5,
                  background: sel ? meta.color : 'transparent',
                  color: sel ? D.bg : meta.color,
                  fontWeight: 600, border: 'none',
                  borderRight: i < V1_FRAMEWORKS.length - 1 ? `1px solid ${D.rule}` : 'none',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                }}
              >
                {meta.short}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: D.textDim, fontStyle: 'italic', marginTop: 8, lineHeight: 1.5 }}>
          {FRAMEWORK_META[settings.defaultFramework].name} — applied to new dream entries by default.
        </div>
      </div>

      {/* Export / Data */}
      <div style={{ padding: '28px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 12 }}>
          YOUR DATA
        </div>
        <button
          onClick={exportData}
          style={{
            width: '100%', padding: '11px 0', textAlign: 'center',
            border: `1px solid ${D.rule}`, color: D.textSoft,
            fontFamily: D.mono, fontSize: 10, letterSpacing: 2,
            background: 'none', cursor: 'pointer', marginBottom: 10,
          }}
        >
          EXPORT ARCHIVE (JSON)
        </button>

        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            style={{
              width: '100%', padding: '11px 0', textAlign: 'center',
              border: `1px solid ${D.ruleSoft}`, color: D.textDim,
              fontFamily: D.mono, fontSize: 10, letterSpacing: 2,
              background: 'none', cursor: 'pointer',
            }}
          >
            DELETE ALL DATA
          </button>
        ) : (
          <FrameBox label="CONFIRM DELETION" accent={D.ruby}>
            <div style={{ fontSize: 13, color: D.textSoft, lineHeight: 1.6, marginBottom: 14 }}>
              This permanently deletes your entire archive — all dreams, interpretations, and symbols. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowReset(false)}
                style={{
                  flex: 1, padding: '10px 0', border: `1px solid ${D.rule}`,
                  color: D.textDim, fontFamily: D.mono, fontSize: 10,
                  letterSpacing: 2, background: 'none', cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={resetAll}
                style={{
                  flex: 1, padding: '10px 0', background: D.ruby, color: D.text,
                  fontFamily: D.mono, fontSize: 10, letterSpacing: 2,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                }}
              >
                DELETE
              </button>
            </div>
          </FrameBox>
        )}
      </div>

      {/* About */}
      <div style={{ padding: '36px 22px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: D.mono, fontSize: 8, color: D.textDim, letterSpacing: 2, lineHeight: 2 }}>
          NOCTUA · V1.0<br />
          DREAMS ARE PRIVATE · NEVER USED FOR TRAINING<br />
          NOT A SUBSTITUTE FOR PROFESSIONAL MENTAL HEALTH CARE
        </div>
      </div>
    </div>
  );
}
