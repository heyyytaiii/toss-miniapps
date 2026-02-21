import { useState, useCallback } from 'react';

const PREFIX = 'budget-challenge:';

function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function useStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue_] = useState<T>(() => getStoredValue(key, defaultValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue_((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        setStoredValue(key, nextValue);
        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}

export { getStoredValue, setStoredValue };
