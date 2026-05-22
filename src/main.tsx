import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Using system font stack (matching AOS brand)

// Service worker: silent auto-update. The new SW activates on next
// navigation; no prompt to the user.
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
