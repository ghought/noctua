import { useState, useRef, useEffect, useCallback } from 'react';
import { D, FRAMEWORK_META, V1_FRAMEWORKS } from '../design';
import { useStore, newDreamId, formatEntryDate } from '../store';
import { HairlineRow } from '../components/HairlineRow';
import type { DreamEntry, Screen } from '../types';
import type { FrameworkKey } from '../design';

const MOODS = ['Anxious', 'Peaceful', 'Searching', 'Tender', 'Unsettled', 'Joyful', 'Confused', 'Melancholy', 'Hopeful', 'Strange'];
const LINE_H = 26;

interface Props {
  navigate: (s: Screen) => void;
  editId?: string;
}

export function Capture({ navigate, editId }: Props) {
  const { saveDream, getDream, nextEntryNumber, settings } = useStore();

  const existing = editId ? getDream(editId) : undefined;

  const [body, setBody] = useState(existing?.body ?? '');
  const [moods, setMoods] = useState<string[]>(existing?.moods ?? []);
  const [isFragment, setIsFragment] = useState(existing?.isFragment ?? false);
  const [framework, setFramework] = useState<FrameworkKey>(
    existing?.framework ?? settings.defaultFramework
  );
  const [showMoods, setShowMoods] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dreamId] = useState(existing?.id ?? newDreamId());
  const [entryNumber] = useState(existing?.entryNumber ?? nextEntryNumber());

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!existing && bodyRef.current) bodyRef.current.focus();
  }, [existing]);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const now = existing?.date ?? new Date().toISOString();
  const dateLabel = formatEntryDate(now);

  const toggleMood = (mood: string) => {
    setMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  // Placeholder title until Claude generates the real one
  const placeholderTitle = isFragment ? '— fragment —' : '— recording —';

  const handleSave = useCallback((): DreamEntry => {
    const dream: DreamEntry = {
      id: dreamId,
      entryNumber,
      date: existing?.date ?? new Date().toISOString(),
      title: existing?.title ?? placeholderTitle,
      body: body.trim(),
      moods,
      framework,
      isFragment,
      interpretations: existing?.interpretations ?? [],
    };
    saveDream(dream);
    setSaved(true);
    return dream;
  }, [dreamId, entryNumber, existing, placeholderTitle, body, moods, framework, isFragment, saveDream]);

  const handleInterpret = () => {
    const dream = handleSave();
    navigate({ name: 'interpretation', dreamId: dream.id, framework });
  };

  return (
    <div style={{
      background: D.bg,
      minHeight: '100dvh',
      fontFamily: D.sans,
      color: D.text,
      paddingBottom: 80,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '56px 22px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={() => navigate({ name: 'archive' })}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: D.mono,
            fontSize: 9,
            letterSpacing: 2,
            color: D.textDim,
            padding: 0,
          }}
        >
          ← ARCHIVE
        </button>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>
          ENTRY №{String(entryNumber).padStart(4, '0')} · {saved ? 'SAVED' : 'DRAFT'}
        </div>
        <button
          onClick={() => { handleSave(); navigate({ name: 'archive' }); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: D.mono,
            fontSize: 9,
            letterSpacing: 2,
            color: D.gold,
            padding: 0,
          }}
        >
          SAVE
        </button>
      </div>

      {/* Meta */}
      <div style={{ padding: '20px 22px 0' }}>
        <HairlineRow label="DATE" value={dateLabel} color={D.gold} />
        <HairlineRow label="WORDS" value={String(wordCount)} />
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
          }}>MOOD</span>
          <span style={{ flex: 1, height: 1, background: D.ruleSoft }} />
          <button
            onClick={() => setShowMoods(s => !s)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: D.mono,
              fontSize: 11,
              color: moods.length > 0 ? D.amethyst : D.textDim,
              letterSpacing: 0.5,
              padding: 0,
            }}
          >
            {moods.length > 0 ? moods.join(' · ').toUpperCase() : 'TAG →'}
          </button>
        </div>

        {showMoods && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '12px 0',
            borderBottom: `1px solid ${D.ruleSoft}`,
            animation: 'fadeIn 0.15s ease',
          }}>
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                style={{
                  padding: '4px 10px',
                  fontFamily: D.mono,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  border: `1px solid ${moods.includes(mood) ? D.amethyst : D.rule}`,
                  color: moods.includes(mood) ? D.amethyst : D.textDim,
                  background: moods.includes(mood) ? `${D.amethyst}22` : 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {mood}
              </button>
            ))}
            <button
              onClick={() => setIsFragment(f => !f)}
              style={{
                padding: '4px 10px',
                fontFamily: D.mono,
                fontSize: 9,
                letterSpacing: 1.5,
                border: `1px solid ${isFragment ? D.ruby : D.rule}`,
                color: isFragment ? D.ruby : D.textDim,
                background: isFragment ? `${D.ruby}22` : 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              FRAGMENT
            </button>
          </div>
        )}
      </div>

      {/* Framework selector */}
      <div style={{ padding: '16px 22px 0' }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold, marginBottom: 8 }}>
          INTERPRET VIA
        </div>
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${D.rule}` }}>
          {V1_FRAMEWORKS.map((fw, i) => {
            const meta = FRAMEWORK_META[fw];
            const sel = framework === fw;
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
                  color: sel ? D.bg : meta.color,
                  fontWeight: 600,
                  border: 'none',
                  borderRight: i < V1_FRAMEWORKS.length - 1 ? `1px solid ${D.rule}` : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {meta.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{
          fontFamily: D.mono,
          fontSize: 9,
          letterSpacing: 2,
          color: D.gold,
          marginBottom: 10,
        }}>
          {isFragment ? 'FRAGMENT' : 'BODY'}
        </div>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={isFragment
            ? 'A single image, a feeling, a fragment of scene…'
            : 'Begin writing your dream…'
          }
          rows={14}
          style={{
            width: '100%',
            fontFamily: D.slab,
            fontSize: 16,
            lineHeight: `${LINE_H}px`,
            color: body ? D.text : D.textDim,
            fontWeight: 400,
            backgroundImage: `linear-gradient(to bottom, transparent ${LINE_H - 1}px, ${D.ruleSoft} ${LINE_H}px)`,
            backgroundSize: `100% ${LINE_H}px`,
            backgroundAttachment: 'local',
            border: 'none',
            padding: 0,
          }}
        />
      </div>

      {/* Bottom toolbar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        padding: '0 18px',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        background: D.bg,
        borderTop: `1px solid ${D.rule}`,
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
        }}>
          <div style={{ display: 'flex', gap: 16, color: D.textSoft }}>
            <button
              onClick={() => setShowMoods(s => !s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 7c.5 1.5 2.5 1.5 3 0M6 6h.01M10 6h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={() => bodyRef.current?.focus()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h10M3 12h7" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </button>
          </div>

          <button
            onClick={handleInterpret}
            disabled={!body.trim()}
            style={{
              fontFamily: D.mono,
              fontSize: 10,
              letterSpacing: 2,
              color: body.trim() ? D.gold : D.textDim,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: body.trim() ? 'pointer' : 'default',
              padding: 0,
              transition: 'color 0.15s',
            }}
          >
            INTERPRET →
          </button>
        </div>
      </div>
    </div>
  );
}
