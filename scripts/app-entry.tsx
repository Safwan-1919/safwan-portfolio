/**
 * Mount entry for the jsdom integration test: renders <App /> into a container
 * exactly like src/main.tsx does, and returns the unmount function.
 */

import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/App';
import { content } from '../src/content/portfolio';

/** The content model, so the tests can assert against the real copy. */
export { content };

export function mountApp(container: HTMLElement): () => void {
  let root: Root | null = createRoot(container);
  root.render(createElement(App));

  return () => {
    root?.unmount();
    root = null;
  };
}