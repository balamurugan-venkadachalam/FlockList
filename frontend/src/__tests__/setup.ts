import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfill for PointerEvent
if (typeof window !== 'undefined') {
  class PointerEvent extends Event {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
    }
  }
  window.PointerEvent = PointerEvent as any;
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
}); 