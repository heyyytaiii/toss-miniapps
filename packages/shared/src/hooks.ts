import { useEffect, useRef } from 'react';

export function useMount(callback: () => void | (() => void)) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return callbackRef.current();
  }, []);
}

export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
