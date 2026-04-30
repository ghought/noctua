import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { initPurchases } from './lib/purchases';

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <StoreProvider>
          <App />
        </StoreProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

// Mount immediately — the app shell renders without waiting for RevenueCat.
// purchases.ts stores the init promise in _initPromise; getOfferings() and
// isExplorer() both await it internally (with their own timeouts), so there
// is no longer any need to delay mounting here.
mount();
initPurchases().catch(err => console.warn('[purchases] init failed:', err));
