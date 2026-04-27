import { D } from '../design';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
  accent?: string;
  style?: React.CSSProperties;
}

export function FrameBox({ children, label, accent = D.gold, style }: Props) {
  const corners = [
    { top: -1, left: -1, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
    { top: -1, right: -1, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
    { bottom: -1, left: -1, borderBottom: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
    { bottom: -1, right: -1, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
  ];

  return (
    <div style={{
      position: 'relative',
      border: `1px solid ${D.rule}`,
      padding: 16,
      ...style,
    }}>
      {label && (
        <div style={{
          position: 'absolute',
          top: -8,
          left: 12,
          padding: '0 6px',
          fontFamily: D.mono,
          fontSize: 9,
          letterSpacing: 2,
          color: accent,
          background: D.bg,
          textTransform: 'uppercase',
        }}>{label}</div>
      )}
      {corners.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 6,
          height: 6,
          ...c,
        }} />
      ))}
      {children}
    </div>
  );
}
