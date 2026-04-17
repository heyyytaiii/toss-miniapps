import { useState, useEffect, useCallback, useRef } from 'react';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  loading: boolean;
  error: string | null;
}

const WATCH_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    loading: true,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const cleanupSdkRef = useRef<(() => void) | null>(null);

  const startWatching = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Try apps-in-toss SDK first (real-time tracking)
      const { startUpdateLocation, Accuracy } = await import(
        '@apps-in-toss/web-framework'
      );
      cleanupSdkRef.current = startUpdateLocation({
        options: {
          accuracy: Accuracy.High,
          timeInterval: 10000, // 10초마다
          distanceInterval: 20, // 20m 이동 시
        },
        onEvent: (location) => {
          setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            loading: false,
            error: null,
          });
        },
        onError: () => {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: '위치를 가져올 수 없어요',
          }));
        },
      });
    } catch {
      // Fallback to browser Geolocation API (web preview)
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: '위치 정보를 사용할 수 없어요',
        }));
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
          });
        },
        (err) => {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              err.code === 1
                ? '위치 권한을 허용해주세요'
                : '위치를 가져올 수 없어요',
          }));
        },
        WATCH_OPTIONS
      );
    }
  }, []);

  useEffect(() => {
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      cleanupSdkRef.current?.();
    };
  }, [startWatching]);

  return { ...state, retry: startWatching };
}
