# AppsInToss 모노레포 - 프로젝트 지시사항

## 프로젝트 개요

앱인토스(토스 미니앱) WebView 기반 미니앱 모노레포.
pnpm workspaces로 관리하며, 각 앱은 독립적인 디자인시스템을 사용한다.

---

## 새 앱 생성 워크플로우 (필수 프로토콜)

사용자가 "새 앱 만들어줘", "앱 하나 추가해줘", "새 프로젝트 시작" 등을 말하면 아래 순서를 **반드시** 따른다:

### Step 1: 기존 앱 확인
- `registry.json`을 읽어서 기존 앱 목록과 사용된 카테고리를 확인한다
- **중복 카테고리는 절대 허용하지 않는다**

### Step 2: 아이디에이션 (AskUserQuestion 사용)
- 기존 카테고리와 **겹치지 않는** 3~4개 앱 아이디어를 제안한다
- 각 아이디어에는 다음을 포함:
  - **앱 이름** (kebab-case, 영문)
  - **카테고리** (한글)
  - **한 줄 설명** (앱이 뭘 하는지)
  - **핵심 기능** 2-3개
  - **수익화 방식** (광고 / 인앱결제 / 없음)
- AskUserQuestion으로 선택지를 제시한다

### Step 3: 수익화 방식 결정
- 사용자 선택에 따라 수익화 방식을 확정한다
- 광고: AdMob 연동 코드 포함
- 인앱결제: IAP 연동 코드 포함
- 없음: 수익화 코드 생략

### Step 4: 앱 스캐폴딩
```bash
pnpm create-app <앱이름> "<카테고리>" "<설명>"
```
- 스크립트가 자동으로: 템플릿 복사 -> 설정 치환 -> registry.json 등록 -> 의존성 설치 -> 테스트 실행

### Step 5: 아이콘 생성 (Stitch MCP)
1. `mcp__stitch__create_project`로 Stitch 프로젝트 생성
2. `mcp__stitch__generate_screen_from_text`로 아이콘 디자인 생성
   - prompt 예시: "Design a mobile app icon for [앱 설명]. Requirements: 1024x1024px, single centered symbol, minimal flat design, solid background color, no text, rounded corners ready. The icon should be simple enough to be recognizable at small sizes."
   - deviceType: "MOBILE"
3. 생성된 아이콘 URL을 `granite.config.ts`의 `icon` 필드에 반영

**아이콘 규정 (앱인토스):**
- 원형 또는 라운드 사각형
- 600px x 600px 이상 권장 (1024x1024 최적)
- 모노톤 아이콘 사용 권장 (토스 내비게이션 바 가이드)
- 앱 콘솔에서 업로드 후 우클릭으로 URL 복사하여 granite.config.ts에 반영

### Step 6: 수익화 코드 통합

#### 광고 (AdMob) 연동 시
앱인토스 WebView SDK의 `GoogleAdMob` 객체를 사용한다:

```tsx
import { GoogleAdMob } from '@apps-in-toss/web-framework';

// 광고 로드 (최신 API - loadAppsInTossAdMob 사용)
const AD_GROUP_ID = '<콘솔에서 발급받은 광고그룹 ID>';

// 광고 미리 로드
const cleanup = GoogleAdMob.loadAppsInTossAdMob({
  adGroupId: AD_GROUP_ID,
  type: 'interstitial', // 'interstitial' | 'rewarded'
  onLoaded: () => console.log('광고 로드 완료'),
  onFailedToLoad: (error) => console.error('광고 로드 실패', error),
});

// 광고 표시
GoogleAdMob.showAppsInTossAdMob({
  adGroupId: AD_GROUP_ID,
  type: 'interstitial',
  onEvent: (event) => {
    switch (event.type) {
      case 'dismissed': console.log('광고 닫힘'); break;
      case 'impression': console.log('광고 노출'); break;
      case 'clicked': console.log('광고 클릭'); break;
    }
  },
});
```

**광고 규정:**
- deprecated된 `loadAdMobInterstitialAd`, `showAdMobInterstitialAd` 사용 금지
- 반드시 `loadAppsInTossAdMob`, `showAppsInTossAdMob` 사용
- 광고 타입: `interstitial`(전면), `rewarded`(보상형) 지원
- 광고 그룹 ID는 앱인토스 콘솔에서 발급

#### 인앱결제 (IAP) 연동 시
앱인토스 WebView SDK의 `IAP` 객체를 사용한다:

```tsx
import { IAP } from '@apps-in-toss/web-framework';

// 1. 상품 목록 조회
const { products } = await IAP.getProductItemList();

// 2. 상품 구매
const result = await IAP.purchaseProduct({ sku: '상품SKU' });

// 3. 상품 지급 완료 처리
await IAP.completeProductGrant({ params: { orderId: result.orderId } });
```

**인앱결제 규정:**
- SDK 1.1.3 이상 필수 (상품 지급 완료 과정 포함)
- SDK 1.2.2 이상 권장 (구매 복원 기능)
- 토스 로그인 연동 필수 (인앱결제 전제조건)
- 대표 관리자의 인앱결제 약관 동의 필요
- 정산 정보 입력 필요 (영업일 2~3일 소요)
- 기기 변경 시에도 상품 유지되도록 서버 저장 구현 필요

### Step 7: 앱 코드 개발
- 사용자의 요구사항에 맞춰 앱 코드를 작성한다
- `apps/<앱이름>/src/pages/` 아래에 페이지 추가
- 공통 유틸은 `@toss-miniapps/shared`에서 import
- 수익화 코드를 적절한 위치에 통합

### Step 8: 테스트 & 검증
- `pnpm --filter @toss-miniapps/<앱이름> test:run` 실행
- `pnpm --filter @toss-miniapps/<앱이름> build` 실행
- 모두 통과해야 완료

### Step 9: 완료 요약
- 생성된 앱 정보 요약 출력
- registry.json 최종 상태 확인
- 수익화 방식 및 필요한 콘솔 설정 안내

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | `@apps-in-toss/web-framework` (Granite) |
| 빌드 | Vite |
| UI | React + TypeScript (TDS 미사용, 앱별 독립 디자인) |
| 테스트 | Vitest + @testing-library/react |
| 패키지매니저 | pnpm workspaces |
| 아이콘 | Stitch MCP 자동 생성 |
| 광고 | `GoogleAdMob` from `@apps-in-toss/web-framework` |
| 인앱결제 | `IAP` from `@apps-in-toss/web-framework` |

## 파일 구조 규칙

- 앱 코드: `apps/<앱이름>/src/`
- 페이지: `apps/<앱이름>/src/pages/`
- 테스트: `apps/<앱이름>/src/__tests__/`
- 공통 유틸: `packages/shared/src/`
- 앱 설정: `apps/<앱이름>/granite.config.ts`

## 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm create-app <name> [category] [desc]` | 새 앱 생성 |
| `pnpm test:all` | 전체 테스트 |
| `pnpm --filter @toss-miniapps/<name> dev` | 개발 서버 |
| `pnpm --filter @toss-miniapps/<name> build` | 빌드 |
| `pnpm --filter @toss-miniapps/<name> test:run` | 앱별 테스트 |

## 주의사항

- 비게임 앱인토스 미니앱은 공식적으로 TDS 필수이나, 이 프로젝트는 독립 디자인시스템을 사용함 (심사 반려 리스크 있음)
- 같은 카테고리의 앱을 중복 생성하지 않는다
- 앱 생성 시 반드시 registry.json에 등록한다
- 광고는 deprecated API 사용 금지, `loadAppsInTossAdMob`/`showAppsInTossAdMob`만 사용
- 인앱결제는 토스 로그인 연동이 선행되어야 한다
- 아이콘은 1024x1024px, 모노톤, 심플한 디자인으로 생성
