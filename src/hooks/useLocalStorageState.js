import { useState, useEffect } from 'react';

export function useLocalStorageState(key, initialValueFactory) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.warn("localStorage error", e);
    }
    return typeof initialValueFactory === 'function' ? initialValueFactory() : initialValueFactory;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
