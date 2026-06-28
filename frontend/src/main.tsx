import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ StrictMode retiré : incompatible avec Framer Motion (AnimatePresence)
// en dev il monte les composants 2x → removeChild crash sur les nœuds animés
createRoot(document.getElementById('root')!).render(
  <App />
);