import { useState, useEffect } from 'react';
import { D, FRAMEWORK_META, V1_FRAMEWORKS } from '../design';
import { useStore } from '../store';
import { HairlineRow } from '../components/HairlineRow';
import { FrameBox } from '../components/FrameBox';
import { Capacitor } from '@capacitor/core';
import { isExplorer } from '../lib/purchases';
import { requestNotificationPermission, scheduleMorningReminder, cancelMorningReminder, getScheduledReminder } from '../lib/notifications';
import type { Screen } from '../types';
import type { FrameworkKey } from '../design';

interface Props {
  navigate: (s: Screen) => void;
  onShowPaywall: () => void;
}

export function Settings({ navigate, onShowPaywall }: Props) {
  const { settings, updateSettings, dreams, symbols } = useStore();
  const [showReset, setShowReset] = useState(false);
  const [explorer, setExplorer] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(8);
  const [notifMinute, setNotifMinute] = useState(0);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;
    isExplorer().then(setExplorer);
    getScheduledReminder().then(n => {
      if (n) {
        setNotifEnabled(true);
        if (n.schedule?.on?.hour != null) setNotifHour(n.schedule.on.hour);
        if (n.schedule?.on?.minute != null) setNotifMinute(n.schedule.on.minute);
      }
    });
  }, [isNative]);

  const setFramework = (fw: FrameworkKey) => updateSettings({ defaultFramework: fw });

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

  const toggleNotifications = async () => {
    if (notifEnabled) {
      await cancelMorningReminder();
      setNotifEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      await scheduleMorningReminder(notifHour, notifMinute);
      setNotifEnabled(true);
    }
  };

  const updateNotifTime = async (hour: number, minute: number) => {
    setNotifHour(hour);
    setNotifMinute(minute);
    if (notifEnabled) await scheduleMorningReminder(hour, minute);
  };

  const formatNotifTime = () => {
    const h = notifHour % 12 || 12;
    const m = String(notifMinute).padStart(2, '0');
    const ampm = notifHour < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div style={{ background: D.bg, minHeight: '100dvh', fontFamily: D.sans, color: D.text, paddingBottom: 60 }}>
      {/* Top */}
      <div style={{ padding: '56px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate({ name: 'archive' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.textDim, padding: 0 }}
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

      {/* Subscription (native only) */}
      {isNative && (
        <div style={{ padding: '28px 22px 0' }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
            SUBSCRIPTION
          </div>
          <HairlineRow
            label="STATUS"
            value={explorer ? 'EXPLORER' : 'FREE TIER'}
          />
          {explorer ? (
            <div style={{ marginTop: 12, fontFamily: D.mono, fontSize: 10, letterSpacing: 1.5, color: D.textDim, lineHeight: 1.6 }}>
              Manage or cancel your subscription in the App Store app under your Apple ID → Subscriptions.
            </div>
          ) : (
            <button
              onClick={onShowPaywall}
              style={{
                width: '100%', marginTop: 12, padding: '11px 0',
                background: D.gold, color: D.bg,
                fontFamily: D.mono, fontSize: 10, letterSpacing: 2,
                fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
            >
              UPGRADE TO EXPLORER
            </button>
          )}
        </div>
      )}

      {/* Morning reminder (native only) */}
      {isNative && (
        <div style={{ padding: '28px 22px 0' }}>
          <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 10 }}>
            MORNING REMINDER
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${D.ruleSoft}` }}>
            <div style={{ fontFamily: D.mono, fontSize: 10, letterSpacing: 1.5, color: D.textSoft }}>DAILY REMINDER</div>
            <button
              onClick={toggleNotifications}
              style={{
                width: 44, height: 26, borderRadius: 13,
                background: notifEnabled ? D.gold : D.rule,
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: notifEnabled ? 21 : 3,
                width: 20, height: 20, borderRadius: 10,
                background: D.bg, transition: 'left 0.2s',
              }} />
            </button>
          </div>
          {notifEnabled && (
            <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: D.mono, fontSize: 10, letterSpacing: 1.5, color: D.textSoft }}>TIME</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={notifHour}
                  onChange={e => updateNotifTime(Number(e.target.value), notifMinute)}
                  style={{ background: D.bg, border: `1px solid ${D.rule}`, color: D.text, fontFamily: D.mono, fontSize: 11, padding: '4px 8px' }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</option>
                  ))}
                </select>
                <select
                  value={notifMinute}
                  onChange={e => updateNotifTime(notifHour, Number(e.target.value))}
                  style={{ background: D.bg, border: `1px solid ${D.rule}`, color: D.text, fontFamily: D.mono, fontSize: 11, padding: '4px 8px' }}
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div style={{ fontSize: 11, color: D.textDim, fontStyle: 'italic', marginTop: 6, lineHeight: 1.5 }}>
            {notifEnabled
              ? `You'll be reminded to capture your dreams at ${formatNotifTime()} each morning.`
              : 'Enable a daily nudge to capture dreams before they fade.'}
          </div>
        </div>
      )}

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
                style={{ flex: 1, padding: '10px 0', border: `1px solid ${D.rule}`, color: D.textDim, fontFamily: D.mono, fontSize: 10, letterSpacing: 2, background: 'none', cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button
                onClick={resetAll}
                style={{ flex: 1, padding: '10px 0', background: D.ruby, color: D.text, fontFamily: D.mono, fontSize: 10, letterSpacing: 2, fontWeight: 600, border: 'none', cursor: 'pointer' }}
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
