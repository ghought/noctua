import { useState, useEffect } from 'react';
import { D, FRAMEWORK_META } from '../design';
import type { FrameworkKey } from '../design';

const FRAMEWORK_FACTS: Record<FrameworkKey, string[]> = {
  jungian: [
    'Jung analyzed over 80,000 dreams across his clinical career — he believed no two were alike.',
    'The shadow holds everything we deny about ourselves. It speaks most clearly through dreams.',
    'Archetypes are not learned — they are inherited patterns embedded in the collective human psyche.',
    'Jung called the dream "a little hidden door in the innermost and most secret recesses of the soul."',
    'Individuation — the journey toward wholeness — is often mapped across years of recurring dreams.',
    'The anima and animus are the unconscious feminine and masculine within each of us, often personified in dreams.',
  ],
  cognitive: [
    'The average person has 4–6 distinct dreams per night, forgetting most within 10 minutes of waking.',
    'During REM sleep, the brain replays and reorganizes memories — consolidating what matters, pruning what doesn\'t.',
    'Threat simulation theory suggests dreaming evolved to rehearse survival scenarios in safety.',
    'REM sleep measurably improves creative problem-solving by finding hidden connections between ideas.',
    'The brain cannot reliably distinguish vivid dreams from waking experiences while they occur.',
    'Emotion processing during dreams reduces the psychological charge of difficult memories — a nightly therapy.',
  ],
  spiritual: [
    'Artemidorus wrote the first systematic dream dictionary in 2nd-century Rome — 5 volumes, 3,000 dreams.',
    'The Talmud teaches: "An uninterpreted dream is like an unread letter."',
    'Ancient Egyptians built dream temples — incubation chambers where priests slept to receive divine guidance.',
    'In Islamic tradition, true dreams (ru\'ya) are considered one forty-sixth of prophecy.',
    'Indigenous traditions across six continents treat dreams as literal communication from ancestors.',
    'The oldest recorded dream is from the Sumerian king Dumuzi, inscribed on clay tablets circa 2500 BCE.',
  ],
  freudian: [
    'Freud called dream interpretation "the royal road to the unconscious."',
    'Every dream, Freud argued, is a disguised fulfillment of a repressed wish.',
    'The manifest content is what you remember; the latent content is what the dream actually means.',
    'Freud\'s Interpretation of Dreams, published in 1899, took eight years to sell its first 600 copies.',
    'Dream distortion, Freud believed, is the censor protecting sleep from disturbing truths.',
  ],
  gestalt: [
    'In Gestalt dreamwork, every figure in a dream — person, object, or landscape — is a part of the self.',
    'Fritz Perls developed Gestalt dream therapy in the 1950s as a reaction against purely analytical approaches.',
    'Rather than interpreting a dream, Gestalt asks you to become each element of it.',
    'The goal is not meaning but contact — felt experience of what the dream is trying to express.',
  ],
  existential: [
    'Existential dream analysis asks not "what does this mean?" but "what does this reveal about how I am living?"',
    'Boss and Binswanger saw dreams as a different mode of being-in-the-world, not an encoded message.',
    'Freedom, death, isolation, and meaning — existentialism\'s four ultimate concerns — appear nightly in dreams.',
    'Heidegger believed authentic existence requires confronting what we most avoid. Dreams often do this for us.',
  ],
};

const CONSTELLATION_POINTS = [
  { x: 50, y: 38 },
  { x: 78, y: 55 },
  { x: 68, y: 82 },
  { x: 32, y: 82 },
  { x: 22, y: 55 },
  { x: 50, y: 62 },
];

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [2, 5], [4, 5],
];

interface Props {
  framework: FrameworkKey;
}

export function InterpretationLoader({ framework }: Props) {
  const facts = FRAMEWORK_FACTS[framework] ?? FRAMEWORK_FACTS.jungian;
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  const color = FRAMEWORK_META[framework].color;

  // Cycle facts every 3.5s with a fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex(i => (i + 1) % facts.length);
        setFactVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [facts.length]);

  // Animate orbit angle
  useEffect(() => {
    let raf: number;
    let start: number;
    const tick = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;
      setOrbitAngle((elapsed / 6000) * 360);
      setLineProgress(Math.min((elapsed / 1800), 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cx = 50;
  const cy = 60;
  const orbitR = 34;
  const orbitX = cx + orbitR * Math.cos((orbitAngle * Math.PI) / 180);
  const orbitY = cy + orbitR * Math.sin((orbitAngle * Math.PI) / 180);

  return (
    <div style={{
      padding: '32px 22px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>

      {/* ── Star chart animation ── */}
      <div style={{ width: 160, height: 160, position: 'relative', marginBottom: 28 }}>
        <svg
          viewBox="0 0 100 120"
          width="160"
          height="160"
          style={{ overflow: 'visible' }}
        >
          {/* Outer orbit ring */}
          <circle
            cx={cx} cy={cy} r={orbitR}
            fill="none"
            stroke={D.rule}
            strokeWidth="0.4"
            strokeDasharray="2 3"
          />

          {/* Constellation lines — draw in progressively */}
          {CONNECTIONS.map(([a, b], i) => {
            const p1 = CONSTELLATION_POINTS[a];
            const p2 = CONSTELLATION_POINTS[b];
            const delay = i / CONNECTIONS.length;
            const progress = Math.max(0, Math.min(1, (lineProgress - delay) * CONNECTIONS.length));
            const ex = p1.x + (p2.x - p1.x) * progress;
            const ey = p1.y + (p2.y - p1.y) * progress;
            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y}
                x2={ex} y2={ey}
                stroke={color}
                strokeWidth="0.35"
                opacity={0.3 + progress * 0.25}
              />
            );
          })}

          {/* Background dust */}
          {[
            { x: 12, y: 18, r: 0.5 }, { x: 88, y: 25, r: 0.4 },
            { x: 8,  y: 90, r: 0.4 }, { x: 92, y: 95, r: 0.5 },
            { x: 50, y: 10, r: 0.3 }, { x: 20, y: 110, r: 0.4 },
            { x: 80, y: 108, r: 0.3 },
          ].map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={D.textDim} opacity="0.6" />
          ))}

          {/* Constellation stars */}
          {CONSTELLATION_POINTS.map((p, i) => {
            const isCentral = i === 5;
            const fadeIn = Math.min(1, lineProgress * 3 - i * 0.3);
            return (
              <g key={i} opacity={Math.max(0, fadeIn)}>
                {isCentral && (
                  <circle cx={p.x} cy={p.y} r={5} fill={color} opacity="0.12" />
                )}
                <circle cx={p.x} cy={p.y} r={isCentral ? 2 : 1.2} fill={color} />
                <circle cx={p.x} cy={p.y} r={isCentral ? 0.8 : 0.5} fill={D.text} />
              </g>
            );
          })}

          {/* Orbiting traveller */}
          <g>
            <circle cx={orbitX} cy={orbitY} r={3.5} fill={color} opacity="0.15" />
            <circle cx={orbitX} cy={orbitY} r={1.5} fill={color} />
            <circle cx={orbitX} cy={orbitY} r={0.6} fill={D.text} />
          </g>

          {/* Axis labels */}
          <text x="2" y="118" fontFamily="JetBrains Mono, monospace" fontSize="5" fill={D.textDim} letterSpacing="0.5">
            ← DEPTH
          </text>
          <text x="62" y="118" fontFamily="JetBrains Mono, monospace" fontSize="5" fill={D.textDim} letterSpacing="0.5">
            RECURRENCE →
          </text>
        </svg>
      </div>

      {/* ── Status text ── */}
      <div style={{
        fontFamily: D.mono,
        fontSize: 9,
        letterSpacing: 2,
        color,
        marginBottom: 10,
        textTransform: 'uppercase',
      }}>
        {FRAMEWORK_META[framework].name}
      </div>

      <div style={{
        fontFamily: D.slab,
        fontSize: 20,
        fontStyle: 'italic',
        color: D.textSoft,
        marginBottom: 32,
        letterSpacing: -0.2,
      }}>
        Consulting the archive…
      </div>

      {/* ── Cycling framework fact ── */}
      <div style={{
        width: '100%',
        border: `1px solid ${D.rule}`,
        position: 'relative',
        padding: '14px 16px',
      }}>
        {/* Corner ticks */}
        {[
          { top: -1, left: -1, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
          { top: -1, right: -1, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` },
          { bottom: -1, left: -1, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` },
          { bottom: -1, right: -1, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` },
        ].map((c, i) => (
          <div key={i} style={{ position: 'absolute', width: 6, height: 6, ...c }} />
        ))}

        <div style={{
          fontFamily: D.mono,
          fontSize: 8,
          letterSpacing: 2,
          color,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          DID YOU KNOW
        </div>

        <div
          style={{
            fontFamily: D.slab,
            fontSize: 14,
            fontStyle: 'italic',
            color: D.text,
            lineHeight: 1.6,
            transition: 'opacity 0.4s ease',
            opacity: factVisible ? 1 : 0,
            minHeight: 68,
          }}
        >
          {facts[factIndex]}
        </div>

        {/* Fact progress dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 12, justifyContent: 'flex-end' }}>
          {facts.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === factIndex ? 12 : 4,
                height: 3,
                background: i === factIndex ? color : D.rule,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
