import { useState, useEffect, useCallback } from 'react';

let GoogleAdMobModule: typeof import('@apps-in-toss/web-framework').GoogleAdMob | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@apps-in-toss/web-framework');
  GoogleAdMobModule = mod.GoogleAdMob ?? null;
} catch {
  GoogleAdMobModule = null;
}

const AD_GROUP_ID = 'BUDGET_CHALLENGE_REWARDED_AD';

interface AdButtonProps {
  label: string;
  onReward: () => void;
}

export default function AdButton({ label, onReward }: AdButtonProps) {
  const [adReady, setAdReady] = useState(false);
  const [sdkAvailable, setSdkAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GoogleAdMobModule) {
      setSdkAvailable(false);
      return;
    }

    try {
      const cleanup = GoogleAdMobModule.loadAppsInTossAdMob({
        adGroupId: AD_GROUP_ID,
        type: 'rewarded',
        onLoaded: () => setAdReady(true),
        onFailedToLoad: () => {
          setSdkAvailable(false);
        },
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    } catch {
      setSdkAvailable(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!sdkAvailable) {
      onReward();
      return;
    }

    if (!GoogleAdMobModule || !adReady) return;

    setLoading(true);
    try {
      GoogleAdMobModule.showAppsInTossAdMob({
        adGroupId: AD_GROUP_ID,
        type: 'rewarded',
        onEvent: (event: { type: string }) => {
          if (event.type === 'dismissed' || event.type === 'impression') {
            onReward();
            setLoading(false);
          }
        },
      });
    } catch {
      onReward();
      setLoading(false);
    }
  }, [sdkAvailable, adReady, onReward]);

  return (
    <button
      className="ad-button"
      onClick={handleClick}
      disabled={loading || (sdkAvailable && !adReady)}
      type="button"
    >
      <span className="icon">🎬</span>
      {loading ? '광고 시청 중...' : sdkAvailable ? label : `${label} (미리보기)`}
    </button>
  );
}
