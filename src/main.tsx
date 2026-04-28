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

// Race purchases init against a 3s timeout.
// If the native RevenueCat plugin hangs (common in simulator),
// we mount immediately rather than waiting forever.
const purchasesInit = initPurchases()
  .catch(err => console.warn('[purchases] init failed:', err));

const safeguard = new Promise<void>(resolve => setTimeout(resolve, 3000));

Promise.race([purchasesInit, safeguard]).finally(mount);
