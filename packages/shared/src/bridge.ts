import { isTossApp } from './env';

type AdType = 'interstitial' | 'rewarded';

interface AdEvent {
  type: 'dismissed' | 'impression' | 'clicked';
}

/**
 * 앱인토스 SDK 래퍼
 * - 토스 환경: 실제 SDK 호출
 * - 웹 환경: mock 동작 (console.log + 즉시 resolve)
 */
export const bridge = {
  /** 광고 로드 */
  loadAd(options: {
    adGroupId: string;
    type: AdType;
    onLoaded?: () => void;
    onFailedToLoad?: (error: unknown) => void;
  }): () => void {
    if (!isTossApp()) {
      console.log(`[mock] 광고 로드: ${options.adGroupId} (${options.type})`);
      setTimeout(() => options.onLoaded?.(), 100);
      return () => {};
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleAdMob } = require('@apps-in-toss/web-framework');
      return (
        GoogleAdMob.loadAppsInTossAdMob({
          adGroupId: options.adGroupId,
          type: options.type,
          onLoaded: options.onLoaded,
          onFailedToLoad: options.onFailedToLoad,
        }) ?? (() => {})
      );
    } catch {
      console.warn('[bridge] GoogleAdMob 로드 실패');
      options.onFailedToLoad?.('SDK not available');
      return () => {};
    }
  },

  /** 광고 표시 */
  showAd(options: {
    adGroupId: string;
    type: AdType;
    onEvent?: (event: AdEvent) => void;
  }): void {
    if (!isTossApp()) {
      console.log(`[mock] 광고 표시: ${options.adGroupId} (${options.type})`);
      setTimeout(() => options.onEvent?.({ type: 'impression' }), 200);
      setTimeout(() => options.onEvent?.({ type: 'dismissed' }), 500);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleAdMob } = require('@apps-in-toss/web-framework');
      GoogleAdMob.showAppsInTossAdMob({
        adGroupId: options.adGroupId,
        type: options.type,
        onEvent: options.onEvent,
      });
    } catch {
      console.warn('[bridge] GoogleAdMob 표시 실패');
      options.onEvent?.({ type: 'dismissed' });
    }
  },

  /** IAP 상품 목록 조회 */
  async getProducts(): Promise<{ products: Array<{ sku: string; title: string; price: string }> }> {
    if (!isTossApp()) {
      console.log('[mock] IAP 상품 목록 조회');
      return {
        products: [
          { sku: 'mock_item_1', title: '테스트 상품', price: '1,000원' },
        ],
      };
    }

    const { IAP } = await import('@apps-in-toss/web-framework');
    return IAP.getProductItemList();
  },

  /** IAP 구매 */
  async purchase(sku: string): Promise<{ orderId: string }> {
    if (!isTossApp()) {
      console.log(`[mock] 구매: ${sku}`);
      return { orderId: `mock_order_${Date.now()}` };
    }

    const { IAP } = await import('@apps-in-toss/web-framework');
    return IAP.purchaseProduct({ sku });
  },

  /** IAP 지급 완료 */
  async completeGrant(orderId: string): Promise<void> {
    if (!isTossApp()) {
      console.log(`[mock] 지급 완료: ${orderId}`);
      return;
    }

    const { IAP } = await import('@apps-in-toss/web-framework');
    await IAP.completeProductGrant({ params: { orderId } });
  },
};
