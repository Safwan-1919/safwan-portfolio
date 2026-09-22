/**
 * KRAFT - entry point.
 * Styles are imported in cascade order: tokens, base, UI blocks.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/extras.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('KRAFT: #root container is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);