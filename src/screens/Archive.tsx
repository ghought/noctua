import { D, FRAMEWORK_META, dreamGlyph, iconButtonStyle, primaryButton, tapBase } from '../design';
import { useStore, formatEntryDate, countThisMonth, dominantFramework } from '../store';
import { TabBar } from '../components/TabBar';
import { HairlineRow } from '../components/HairlineRow';
import { FrameBox } from '../components/FrameBox';
import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

export function Archive({ navigate }: Props) {
  const { dreams, symbols } = useStore();

  const monthCount = countThisMonth(dreams);
  const domFw = dominantFramework(dreams);
  const domSymbol = symbols[0];
  const totalEntries = dreams.length;
  const vol = Math.floor(totalEntries / 100) + 1;

  const today = new Date();
  const todayStr = formatEntryDate(today.toISOString());

  const hasTodayEntry = dreams.some(d => {
    const dd = new Date(d.date);
    return dd.toDateString() === today.toDateString();
  });

  return (
    <div style={{
      background: D.bg,
      minHeight: '100dvh',
      fontFamily: D.sans,
      color: D.text,
      paddingBottom: 90,
    }}>
      {/* Top metadata strip */}
      <div style={{
        padding: '48px 18px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>
          NOCTUA · ARCHIVE
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim }}>
            {todayStr}
          </div>
          <button
            onClick={() => navigate({ name: 'settings' })}
            style={{
              ...iconButtonStyle(44, D.textSoft),
            }}
            aria-label="Settings"
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="7" cy="5" r="1.7" fill={D.bg} stroke="currentColor" strokeWidth="1.1"/>
              <circle cx="12" cy="9" r="1.7" fill={D.bg} stroke="currentColor" strokeWidth="1.1"/>
              <circle cx="6" cy="13" r="1.7" fill={D.bg} stroke="currentColor" strokeWidth="1.1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontFamily: D.mono, fontSize: 11, color: D.gold, letterSpacing: 1.5 }}>
            VOL · {String(vol).padStart(2, '0')}
          </div>
          <div style={{ flex: 1, height: 1, background: D.rule }} />
          <div style={{ fontFamily: D.mono, fontSize: 11, color: D.textDim }}>
            {totalEntries} {totalEntries === 1 ? 'ENTRY' : 'ENTRIES'}
          </div>
        </div>
        <div style={{
          fontFamily: D.slab,
          fontSize: 40,
          fontWeight: 400,
          color: D.text,
          lineHeight: 1,
          marginTop: 16,
          letterSpacing: -0.5,
        }}>
          Dream<br />
          <span style={{ color: D.gold, fontStyle: 'italic' }}>Archive.</span>
        </div>
      </div>

      {/* Stats hairlines */}
      {dreams.length > 0 && (
        <div style={{ padding: '24px 22px 0' }}>
          <HairlineRow
            label="THIS MONTH"
            value={`${monthCount} ${monthCount === 1 ? 'night' : 'nights'}`}
            color={D.gold}
          />
          {domFw && (
            <HairlineRow
              label="DOMINANT FRAMEWORK"
              value={`${FRAMEWORK_META[domFw.key].name.toUpperCase()} · ${domFw.pct}%`}
              color={FRAMEWORK_META[domFw.key].color}
            />
          )}
          {domSymbol && (
            <HairlineRow
              label="DOMINANT SYMBOL"
              value={`${domSymbol.name.toUpperCase()} · ${domSymbol.count}/${dreams.length}`}
              color={D.sapphire}
            />
          )}
        </div>
      )}

      {/* Capture cue */}
      {!hasTodayEntry && (
        <div style={{ margin: '24px 18px 0' }}>
          <FrameBox label="UNRECORDED" accent={D.gold}>
            <div style={{
              fontFamily: D.slab,
              fontSize: 18,
              fontWeight: 400,
              color: D.text,
              lineHeight: 1.3,
              fontStyle: 'italic',
            }}>
              What did you dream last night?
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => navigate({ name: 'capture' })}
                style={{
                  ...primaryButton(),
                  flex: 1,
                }}
              >
                BEGIN ENTRY
              </button>
            </div>
          </FrameBox>
        </div>
      )}

      {/* Recent entries */}
      {dreams.length > 0 ? (
        <>
          <div style={{
            padding: '24px 22px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>RECENT</div>
            <div style={{ flex: 1, height: 1, background: D.rule }} />
          </div>

          <div style={{ padding: '0 22px' }}>
            {dreams.slice(0, 20).map((dream, i) => {
              const fw = FRAMEWORK_META[dream.framework];
              const glyph = dreamGlyph(dream.id);
              const hasInterp = dream.interpretations.length > 0;

              return (
                <button
                  key={dream.id}
                  onClick={() => navigate(
                    hasInterp
                      ? { name: 'interpretation', dreamId: dream.id }
                      : { name: 'capture', editId: dream.id }
                  )}
                  style={{
                    ...tapBase,
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '16px 0',
                    borderBottom: i < dreams.slice(0, 20).length - 1
                      ? `1px solid ${D.ruleSoft}`
                      : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{
                      fontFamily: D.mono,
                      fontSize: 11,
                      color: D.textDim,
                      letterSpacing: 1.5,
                      width: 48,
                    }}>
                      №{String(dream.entryNumber).padStart(4, '0')}
                    </span>
                    <span style={{
                      fontFamily: D.mono,
                      fontSize: 11,
                      color: D.gold,
                      letterSpacing: 1.5,
                    }}>
                      {formatEntryDate(dream.date)}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{
                      fontFamily: D.mono,
                      fontSize: 11,
                      color: fw.color,
                      letterSpacing: 1.5,
                    }}>
                      {fw.short}
                    </span>
                    <span style={{ fontSize: 15, color: fw.color }}>{glyph}</span>
                  </div>
                  <div style={{
                    fontFamily: D.slab,
                    fontSize: 21,
                    fontWeight: 400,
                    color: dream.isFragment ? D.textSoft : D.text,
                    marginTop: 6,
                    letterSpacing: -0.2,
                    lineHeight: 1.2,
                    fontStyle: dream.isFragment ? 'italic' : 'normal',
                  }}>
                    {dream.title}
                  </div>
                  <div style={{
                    fontFamily: D.sans,
                    fontSize: 14,
                    color: D.textSoft,
                    marginTop: 4,
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  } as React.CSSProperties}>
                    {dream.body.slice(0, 120)}{dream.body.length > 120 ? '…' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{
          padding: '48px 22px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: D.slab,
            fontSize: 16,
            fontStyle: 'italic',
            color: D.textDim,
            lineHeight: 1.6,
          }}>
            Your archive is empty.<br />Begin your first entry above.
          </div>
        </div>
      )}

      {/* New entry FAB (when there's already a today entry) */}
      {hasTodayEntry && (
        <button
          onClick={() => navigate({ name: 'capture' })}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 16px) + 76px)',
            right: 'max(calc(50vw - 215px + 16px), 16px)',
            width: 52,
            height: 52,
            background: D.gold,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke={D.bg} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <TabBar active="archive" navigate={navigate} />
    </div>
  );
}
