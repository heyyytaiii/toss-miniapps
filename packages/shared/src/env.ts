/**
 * 토스 앱 내부(WebView) 환경인지 감지
 */
export function isTossApp(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      /TossApp|AppsInToss/i.test(navigator.userAgent)
    );
  } catch {
    return false;
  }
}

/**
 * 웹 브라우저(개발/프리뷰) 환경인지
 */
export function isWebPreview(): boolean {
  return !isTossApp();
}
