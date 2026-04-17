// Ads helper using 인앱 광고 2.0 ver2 API
// Banner: TossAds.initialize + TossAds.attachBanner
// Fullscreen: loadFullScreenAd + showFullScreenAd

const BANNER_AD_GROUP_ID = import.meta.env.VITE_BANNER_AD_GROUP_ID || 'ait-ad-test-banner-id';
const FULLSCREEN_AD_GROUP_ID = import.meta.env.VITE_FULLSCREEN_AD_GROUP_ID || 'ait.dev.43daa14da3ae487b';

let bannerInitialized = false;
let fullscreenLoaded = false;

// --- Banner Ad ---

export async function initBannerAd(): Promise<boolean> {
  try {
    const { TossAds } = await import('@apps-in-toss/web-framework');
    if (!TossAds.initialize.isSupported()) return false;

    return new Promise((resolve) => {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            bannerInitialized = true;
            resolve(true);
          },
          onInitializationFailed: () => resolve(false),
        },
      });
    });
  } catch {
    return false;
  }
}

export async function attachBanner(element: HTMLElement): Promise<(() => void) | null> {
  if (!bannerInitialized) {
    const ok = await initBannerAd();
    if (!ok) return null;
  }

  try {
    const { TossAds } = await import('@apps-in-toss/web-framework');
    const result = TossAds.attachBanner(BANNER_AD_GROUP_ID, element, {
      theme: 'auto',
      tone: 'grey',
      variant: 'expanded',
      callbacks: {
        onAdFailedToRender: (payload) => {
          console.warn('배너 광고 렌더링 실패:', payload.error?.message);
        },
      },
    });
    return () => result?.destroy();
  } catch {
    return null;
  }
}

// --- Fullscreen Ad (Interstitial) ---

export async function loadFullscreen(): Promise<boolean> {
  try {
    const { loadFullScreenAd } = await import('@apps-in-toss/web-framework');
    if (!loadFullScreenAd.isSupported()) return false;

    return new Promise((resolve) => {
      loadFullScreenAd({
        options: { adGroupId: FULLSCREEN_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            fullscreenLoaded = true;
            resolve(true);
          }
        },
        onError: () => resolve(false),
      });
    });
  } catch {
    return false;
  }
}

export async function showFullscreen(): Promise<void> {
  if (!fullscreenLoaded) return;

  try {
    const { showFullScreenAd, loadFullScreenAd } = await import('@apps-in-toss/web-framework');

    showFullScreenAd({
      options: { adGroupId: FULLSCREEN_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'dismissed') {
          fullscreenLoaded = false;
          // Preload next ad
          loadFullScreenAd({
            options: { adGroupId: FULLSCREEN_AD_GROUP_ID },
            onEvent: (e) => {
              if (e.type === 'loaded') fullscreenLoaded = true;
            },
            onError: () => {},
          });
        }
      },
      onError: () => {},
    });
  } catch {
    // Not in toss app environment
  }
}
