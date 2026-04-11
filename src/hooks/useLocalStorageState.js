import { useState, useEffect } from 'react';

export function useLocalStorageState(key, initialValueFactory, validator) {
  const [state, setState] = useState(() => {
    const initialValue = typeof initialValueFactory === 'function' ? initialValueFactory() : initialValueFactory;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);

        if (validator && typeof validator === 'function') {
          if (validator(parsed)) return parsed;
        } else {
          // Basic type validation
          if (initialValue === null || initialValue === undefined) {
            return parsed;
          }

          if (Array.isArray(initialValue)) {
            if (Array.isArray(parsed)) return parsed;
          } else if (typeof parsed === typeof initialValue && parsed !== null && !Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch {
      console.warn("localStorage error");
    }
    return initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
