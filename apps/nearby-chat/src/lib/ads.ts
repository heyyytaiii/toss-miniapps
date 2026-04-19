// Ads helper using 인앱 광고 2.0 ver2 API
// Banner: TossAds.initialize + TossAds.attachBanner
// Fullscreen: loadFullScreenAd + showFullScreenAd

const BANNER_AD_GROUP_ID = 'ait.v2.live.11f998ebd24e413d';
const FULLSCREEN_AD_GROUP_ID = 'ait.v2.live.f9404b0b04874369';

// Ads only run in production builds. Local dev = no ads, no ad gate modal.
export const adsEnabled = import.meta.env.PROD;

let bannerInitialized = false;
let fullscreenLoaded = false;

// --- Banner Ad ---

export async function initBannerAd(): Promise<boolean> {
  if (!adsEnabled) return false;
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
  if (!adsEnabled) return null;
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
  if (!adsEnabled) return false;
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

export async function showFullscreen(): Promise<boolean> {
  if (!fullscreenLoaded) return false;

  try {
    const { showFullScreenAd, loadFullScreenAd } = await import('@apps-in-toss/web-framework');

    return new Promise((resolve) => {
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
