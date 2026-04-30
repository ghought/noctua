import { useState, useEffect } from 'react';
import { D, primaryButton, smallTextButton, tapBase } from '../design';
import { useStore } from '../store';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';

interface Props {
  onUnlocked: () => void;
  onDismiss: () => void;
}

const FEATURES = [
  'Unlimited dream interpretations',
  'All six analytical lenses',
  'Symbol cartography across time',
  'Pattern recognition & recurring themes',
  'Export your full archive',
];

export function Paywall({ onUnlocked, onDismiss }: Props) {
  const { updateSettings } = useStore();
  const [offering, setOffering] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOfferings().then(o => {
      setOffering(o);
      if (o?.availablePackages?.length) {
        const yearly = o.availablePackages.find((p: any) => p.packageType === 'ANNUAL');
        setSelected(yearly?.identifier ?? o.availablePackages[0].identifier);
      }
    }).catch(() => setError('Could not load subscription options. Check your connection and try again.'))
      .finally(() => setOfferingsLoading(false));
  }, []);

  const purchase = async () => {
    if (!offering || !selected) return;
    const pkg = offering.availablePackages.find((p: any) => p.identifier === selected);
    if (!pkg) return;

    setLoading(true);
    setError(null);
    try {
      const { success, cancelled } = await purchasePackage(pkg);
      if (success) {
        updateSettings({ isSubscribed: true });
        onUnlocked();
      } else if (!cancelled) setError('Purchase not completed. Please try again.');
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    setLoading(true);
    setError(null);
    try {
      const active = await restorePurchases();
      if (active) {
        updateSettings({ isSubscribed: true });
        onUnlocked();
      } else setError('No previous purchase found for this Apple ID.');
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sortOrder = ['LIFETIME', 'ANNUAL', 'MONTHLY'];
  const sorted = offering?.availablePackages?.slice().sort(
    (a: any, b: any) => sortOrder.indexOf(a.packageType) - sortOrder.indexOf(b.packageType)
  ) ?? [];

  return (
    <div style={{ background: D.bg, minHeight: '100dvh', fontFamily: D.sans, color: D.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: '48px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: D.mono, fontSize: 9, letterSpacing: 2, color: D.gold }}>
          NOCTUA EXPLORER
        </div>
        <button
          onClick={onDismiss}
          style={smallTextButton(D.textSoft)}
        >
          NOT NOW
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: '28px 22px 0' }}>
        <div style={{ fontFamily: D.slab, fontSize: 32, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 12 }}>
          Unlock the<br />
          <span style={{ color: D.gold }}>full archive.</span>
        </div>
        <div style={{ fontSize: 14, color: D.textSoft, lineHeight: 1.6, marginBottom: 24 }}>
          Your free access covers 3 interpretations per month. Explorer opens everything — past, present, and every lens.
        </div>

        <div style={{ height: 1, background: D.rule, marginBottom: 20 }} />

        {/* Features */}
        {FEATURES.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 4, background: D.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: D.textSoft }}>{f}</div>
          </div>
        ))}
      </div>

      {/* Package selector */}
      <div style={{ padding: '24px 22px 0' }}>
        {offeringsLoading && (
          <div style={{ fontFamily: D.mono, fontSize: 10, letterSpacing: 2, color: D.textDim, textAlign: 'center', padding: '20px 0' }}>
            LOADING OPTIONS…
          </div>
        )}
        {!offeringsLoading && sorted.length === 0 && !error && (
          <div style={{ fontFamily: D.mono, fontSize: 10, letterSpacing: 1.5, color: D.textDim, textAlign: 'center', padding: '16px 0', lineHeight: 1.8 }}>
            Subscription options unavailable.{'\n'}Please try again later.
          </div>
        )}
        {sorted.map((pkg: any) => {
          const sel = selected === pkg.identifier;
          const isPopular = pkg.packageType === 'ANNUAL';
          return (
            <button
              key={pkg.identifier}
              onClick={() => setSelected(pkg.identifier)}
              style={{
                width: '100%',
                marginBottom: 10,
                minHeight: 66,
                padding: '14px 16px',
                textAlign: 'left',
                background: sel ? 'rgba(201,168,102,0.08)' : 'transparent',
                border: `1px solid ${sel ? D.gold : D.rule}`,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {isPopular && (
                <div style={{
                  position: 'absolute', top: -9, left: 14,
                  background: D.gold, color: D.bg,
                  fontFamily: D.mono, fontSize: 8, letterSpacing: 2, padding: '2px 8px',
                }}>
                  MOST POPULAR
                </div>
              )}
              <div>
                <div style={{ fontFamily: D.mono, fontSize: 11, letterSpacing: 1.5, color: sel ? D.gold : D.text }}>
                  {pkg.product.title}
                </div>
                <div style={{ fontSize: 12, color: D.textDim, marginTop: 2 }}>
                  {pkg.packageType === 'LIFETIME' ? 'One time' : pkg.packageType === 'ANNUAL' ? 'Billed annually' : 'Billed monthly'}
                </div>
              </div>
              <div style={{ fontFamily: D.slab, fontSize: 18, fontStyle: 'italic', color: sel ? D.gold : D.textSoft }}>
                {pkg.product.priceString}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 22px 0', fontFamily: D.mono, fontSize: 10, color: D.ruby, letterSpacing: 1 }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <div style={{ padding: '16px 22px 0' }}>
        <button
          onClick={purchase}
          disabled={loading || offeringsLoading || !offering || !selected}
          style={{
            ...primaryButton(loading || offeringsLoading || !offering || !selected),
          }}
        >
          {loading ? 'PROCESSING…' : offeringsLoading ? 'LOADING…' : 'CONTINUE'}
        </button>

        <button
          onClick={restore}
          disabled={loading}
          style={{
            ...tapBase,
            width: '100%',
            marginTop: 12,
            background: 'none',
            border: `1px solid ${D.ruleSoft}`,
            color: D.textDim,
            fontFamily: D.mono,
            fontSize: 9,
            letterSpacing: 2,
            cursor: 'pointer',
            padding: '0 12px',
          }}
        >
          RESTORE PURCHASE
        </button>

        <div style={{ marginTop: 16, fontFamily: D.mono, fontSize: 8, color: D.textDim, letterSpacing: 1, lineHeight: 1.6, textAlign: 'center' }}>
          Subscriptions auto-renew. Cancel anytime in App Store settings.
        </div>
      </div>
    </div>
  );
}
