import React, { useCallback, useEffect, useRef, useState } from 'react';

let GoogleAdMob: typeof import('@apps-in-toss/web-framework').GoogleAdMob | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fw = require('@apps-in-toss/web-framework');
  GoogleAdMob = fw.GoogleAdMob;
} catch {
  // SDK not available in dev/test
}

const AD_GROUP_ID = 'LUCK_DRAWER_REWARDED_AD';

interface AdButtonProps {
  onReward: () => void;
  label?: string;
}

export default function AdButton({ onReward, label = '광고 보고 추가 기회 받기' }: AdButtonProps) {
  const [adReady, setAdReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!GoogleAdMob) return;

    try {
      cleanupRef.current = GoogleAdMob.loadAppsInTossAdMob({
        adGroupId: AD_GROUP_ID,
        type: 'rewarded',
        onLoaded: () => setAdReady(true),
        onFailedToLoad: (_error) => setAdReady(false),
      }) as unknown as () => void;
    } catch {
      // WebView SDK not available (dev/test environment)
      GoogleAdMob = null;
    }

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handleClick = useCallback(() => {
    if (!GoogleAdMob || !adReady) return;
    setLoading(true);

    GoogleAdMob.showAppsInTossAdMob({
      adGroupId: AD_GROUP_ID,
      type: 'rewarded',
      onEvent: (event) => {
        if (event.type === 'dismissed') {
          onReward();
          setLoading(false);
          setAdReady(false);
          // Reload next ad
          cleanupRef.current = GoogleAdMob!.loadAppsInTossAdMob({
            adGroupId: AD_GROUP_ID,
            type: 'rewarded',
            onLoaded: () => setAdReady(true),
            onFailedToLoad: () => setAdReady(false),
          }) as unknown as () => void;
        }
      },
    });
  }, [adReady, onReward]);

  // In dev/test where SDK isn't available, show a mock button
  if (!GoogleAdMob) {
    return (
      <button
        className="ad-button"
        onClick={onReward}
        type="button"
        data-testid="ad-button"
      >
        <span>🎬</span>
        <span>{label} (개발 모드)</span>
      </button>
    );
  }

  return (
    <button
      className="ad-button"
      onClick={handleClick}
      disabled={!adReady || loading}
      type="button"
      data-testid="ad-button"
    >
      <span>🎬</span>
      <span>{loading ? '광고 재생 중...' : label}</span>
    </button>
  );
}
