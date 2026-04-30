import { useState, useCallback, useEffect } from 'react';
import { useStore } from './store';
import { isExplorer } from './lib/purchases';
import { Onboarding } from './screens/Onboarding';
import { Archive } from './screens/Archive';
import { Capture } from './screens/Capture';
import { Interpretation } from './screens/Interpretation';
import { Charts } from './screens/Charts';
import { Index } from './screens/Index';
import { Settings } from './screens/Settings';
import { Paywall } from './screens/Paywall';
import type { Screen } from './types';

export function App() {
  const { settings, updateSettings } = useStore();
  const [screen, setScreen] = useState<Screen>(
    settings.onboarded ? { name: 'archive' } : { name: 'onboarding' }
  );
  const [showPaywall, setShowPaywall] = useState(false);

  // Background sync: upgrade local subscription state if RevenueCat confirms active
  useEffect(() => {
    if (!settings.isSubscribed) {
      isExplorer().then(active => {
        if (active) updateSettings({ isSubscribed: true });
      }).catch(() => {});
    }
  }, []);

  const navigate = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.getElementById('root')?.scrollTo({ top: 0, left: 0 });
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setScreen({ name: 'archive' });
  }, []);

  if (showPaywall) {
    return (
      <div style={{ width: '100%', maxWidth: 430, flex: 1 }}>
        <Paywall
          onUnlocked={() => setShowPaywall(false)}
          onDismiss={() => {
            setShowPaywall(false);
            setScreen({ name: 'archive' }); // go to archive so interpretation doesn't re-trigger
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 430, flex: 1 }}>
      {screen.name === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {screen.name === 'archive' && (
        <Archive navigate={navigate} />
      )}
      {screen.name === 'capture' && (
        <Capture navigate={navigate} editId={screen.editId} />
      )}
      {screen.name === 'interpretation' && (
        <Interpretation
          navigate={navigate}
          dreamId={screen.dreamId}
          initialFramework={screen.framework}
          onShowPaywall={() => setShowPaywall(true)}
        />
      )}
      {screen.name === 'charts' && (
        <Charts navigate={navigate} />
      )}
      {screen.name === 'index' && (
        <Index navigate={navigate} />
      )}
      {screen.name === 'settings' && (
        <Settings navigate={navigate} onShowPaywall={() => setShowPaywall(true)} />
      )}
    </div>
  );
}
