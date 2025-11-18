import crypto from "node:crypto";
import { TextDecoder, TextEncoder } from "node:util";
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: crypto.randomUUID,
  },
});

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (typeof window.TextDecoder === "undefined") {
  Object.defineProperty(window, "TextDecoder", {
    value: TextDecoder,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "TextEncoder", {
    value: TextEncoder,
    writable: true,
    configurable: true,
  });
}

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});
