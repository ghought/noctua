import { D, tapBase } from '../design';
import type { Screen } from '../types';

type TabId = 'archive' | 'capture' | 'charts' | 'index';

interface Props {
  active: TabId;
  navigate: (s: Screen) => void;
}

const TABS: { id: TabId; label: string; n: string; screen: Screen }[] = [
  { id: 'archive', label: 'ARCHIVE', n: '01', screen: { name: 'archive' } },
  { id: 'capture', label: 'CAPTURE', n: '02', screen: { name: 'capture' } },
  { id: 'charts',  label: 'CHARTS',  n: '03', screen: { name: 'charts' } },
  { id: 'index',   label: 'INDEX',   n: '04', screen: { name: 'index' } },
];

export function TabBar({ active, navigate }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      paddingTop: 12,
      background: `linear-gradient(180deg, transparent, ${D.bg} 30%)`,
      borderTop: `1px solid ${D.rule}`,
      display: 'flex',
      justifyContent: 'space-around',
      fontFamily: D.mono,
      zIndex: 100,
    }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.screen)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            color: active === tab.id ? D.gold : D.textDim,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            ...tapBase,
            padding: '6px 12px',
            transition: 'color 0.15s',
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.7 }}>{tab.n}</div>
          <div style={{ fontSize: 12, letterSpacing: 1.8, fontWeight: 500 }}>{tab.label}</div>
          <div style={{
            width: active === tab.id ? 16 : 0,
            height: 1,
            background: D.gold,
            transition: 'width 0.2s',
          }} />
        </button>
      ))}
    </div>
  );
}
