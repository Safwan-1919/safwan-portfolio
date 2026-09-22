/**
 * Strict <canvas> 2D stub shared by the Node tests.
 *
 * The theme draws all of its art procedurally, so the tests need a canvas that
 * behaves like a context but fails loudly when drawing maths go wrong (NaN or
 * Infinity coordinates, negative radii handed to arc(), etc).
 */

export function installCanvasStub() {
  const canvases = [];

  function createContext(canvas) {
    const base = {
      canvas,
      measureText: (text) => ({ width: String(text).length * 14 }),
      createLinearGradient: () => ({ addColorStop: () => undefined }),
      createRadialGradient: () => ({ addColorStop: () => undefined }),
      createPattern: () => null,
    };

    return new Proxy(base, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (typeof prop !== 'string') return undefined;
        return (...args) => {
          args.forEach((arg) => {
            if (typeof arg === 'number' && !Number.isFinite(arg)) {
              throw new Error(`ctx.${prop}() received a non-finite number: ${String(arg)}`);
            }
          });
          return undefined;
        };
      },
      set(target, prop, value) {
        if (typeof value === 'number' && !Number.isFinite(value)) {
          throw new Error(`ctx.${prop} = ${String(value)} is not finite`);
        }
        target[prop] = value;
        return true;
      },
    });
  }

  function createElement(tag) {
    if (tag !== 'canvas') {
      return {
        style: {},
        setAttribute: () => undefined,
        appendChild: () => undefined,
        removeChild: () => undefined,
      };
    }
    const canvas = {
      width: 0,
      height: 0,
      style: {},
      getContext: () => createContext(canvas),
      toDataURL: () => 'data:image/png;base64,iVBORw0KGgo=',
    };
    canvases.push(canvas);
    return canvas;
  }

  const documentStub = {
    createElement,
    createElementNS: () => createElement('canvas'),
    fonts: { ready: Promise.resolve(), add: () => undefined, addEventListener: () => undefined },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    querySelectorAll: () => [],
    body: {
      classList: { add: () => undefined, remove: () => undefined, toggle: () => undefined, contains: () => false },
    },
    documentElement: { style: {} },
  };

  globalThis.document = documentStub;
  globalThis.document = documentStub;

  if (!globalThis.window) {
    globalThis.window = {
      innerWidth: 1440,
      innerHeight: 900,
      matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
      localStorage: {
        store: new Map(),
        getItem(key) {
          return this.store.has(key) ? this.store.get(key) : null;
        },
        setItem(key, value) {
          this.store.set(key, String(value));
        },
        removeItem(key) {
          this.store.delete(key);
        },
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      requestAnimationFrame: (callback) => setTimeout(callback, 0),
      cancelAnimationFrame: () => undefined,
      setTimeout,
      clearTimeout,
    };
  }

  // Node >= 21 already exposes a read-only `navigator`; only fill in the
  // properties the app reads when they are missing.
  const nav = globalThis.navigator;
  if (nav && nav.hardwareConcurrency === undefined) {
    Object.defineProperty(nav, 'hardwareConcurrency', { value: 8, configurable: true });
  }

  return { canvases, documentStub };
}
