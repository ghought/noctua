import { D } from '../design';

interface Props {
  label: string;
  value: string;
  color?: string;
}

export function HairlineRow({ label, value, color = D.textSoft }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      padding: '6px 0',
      borderBottom: `1px solid ${D.ruleSoft}`,
    }}>
      <span style={{
        fontFamily: D.mono,
        fontSize: 9,
        color: D.textDim,
        letterSpacing: 1.5,
        minWidth: 90,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: D.ruleSoft }} />
      <span style={{
        fontFamily: D.mono,
        fontSize: 11,
        color,
        letterSpacing: 0.5,
        textAlign: 'right',
        maxWidth: 180,
      }}>{value}</span>
    </div>
  );
}
