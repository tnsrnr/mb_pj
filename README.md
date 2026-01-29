# GS Portal Mobile

React Native Expo 기반의 학습 앱입니다.

## 시작하기

### 사전 요구사항

- Node.js (v18 이상)
- npm 또는 yarn
- Expo CLI (또는 npx 사용)

### 설치

```bash
# 의존성 설치
npm install

# 또는
yarn install
```

### 실행

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹에서 실행
npm run web
```

## 프로젝트 구조

```
gs_portal_mobile/
├── src/
│   ├── screens/          # 화면 컴포넌트
│   │   ├── SettingsScreen.tsx
│   │   └── StudyScreen.tsx
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── SwipeableCard.tsx
│   │   ├── ChoiceButton.tsx
│   │   └── TopicCard.tsx
│   ├── services/         # API 통신
│   │   └── api.ts
│   ├── store/            # 상태 관리 (Zustand)
│   │   └── studyStore.ts
│   ├── types/            # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/            # 유틸리티 및 상수
│   │   └── constants.ts
│   └── navigation/       # 네비게이션 설정
│       └── AppNavigator.tsx
├── App.tsx               # 앱 진입점
├── app.json              # Expo 설정
└── package.json
```

## 주요 기능

### 1. 설정 화면
- 대분류 멀티 선택
- 학습 방식 선택 (전체 학습, 정의 선택, 토픽 찾기)
- 학습 모드 선택 (랜덤, 순차)
- 선택지 개수 설정
- 토픽 새로고침

### 2. 학습 화면
- 스와이프 제스처로 다음/이전 토픽 이동
- 정답 클릭 시 자동으로 다음 토픽으로 이동
- 학습 진행도 표시
- 학습 완료 메시지

## API 설정

`src/utils/constants.ts` 파일에서 API 서버 URL이 자동으로 설정됩니다.

### 개발 환경
- **iOS 시뮬레이터**: `http://localhost:3000` (기본값)
- **Android 에뮬레이터**: `http://10.0.2.2:3000` (주석 해제 필요)
- **실제 기기**: 개발 서버의 로컬 IP 주소 사용 (예: `http://192.168.1.100:3000`)

### 프로덕션 환경
`src/utils/constants.ts` 파일에서 프로덕션 서버 URL로 변경하세요:

```typescript
// 프로덕션 환경
return 'https://your-production-server.com';
```

### Next.js 서버 실행
gs_portal 폴더에서 Next.js 개발 서버를 실행하세요:

```bash
cd ../gs_portal
npm run dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 사용된 기술

- **React Native** - 모바일 앱 프레임워크
- **Expo** - 개발 도구 및 빌드 시스템
- **TypeScript** - 타입 안정성
- **React Navigation** - 네비게이션
- **Zustand** - 상태 관리
- **React Native Reanimated** - 애니메이션
- **React Native Gesture Handler** - 제스처 처리
- **Axios** - HTTP 클라이언트
- **React Native Paper** - UI 컴포넌트 라이브러리

## 빌드

### Android APK 빌드

```bash
eas build --platform android
```

### iOS 빌드

```bash
eas build --platform ios
```

## 주의사항

1. **API URL 설정**: `src/utils/constants.ts`에서 API 서버 URL을 반드시 설정해야 합니다.
2. **CORS 설정**: 웹 서버에서 CORS 설정이 필요할 수 있습니다.
3. **네트워크 권한**: Android에서는 인터넷 권한이 필요합니다 (Expo가 자동으로 처리).

## 디버깅 가이드

React Native 개발 시 핸드폰에서만 에러가 보이는 문제를 해결하기 위한 표준 방법들입니다.

### 1. 터미널에서 에러 확인 (기본 방법)

이 프로젝트는 자동으로 모든 에러를 터미널에 출력하도록 설정되어 있습니다:
- **전역 에러**: 앱 전체에서 발생하는 모든 에러
- **컴포넌트 에러**: React 컴포넌트에서 발생하는 에러
- **비동기 에러**: Promise rejection 등

에러가 발생하면 터미널에 다음과 같이 표시됩니다:
```
❌ ========== 전역 에러 발생 ==========
📱 에러 메시지: [에러 내용]
📍 스택 트레이스: [상세 스택]
⚠️  치명적 에러: true/false
========================================
```

### 2. React Native LogBox 사용

앱이 실행 중일 때:
- **터미널에서 `j` 키**: 디버거 열기
- **터미널에서 `r` 키**: 앱 리로드
- **터미널에서 `m` 키**: 개발자 메뉴 토글

### 3. 원격 디버깅 (Chrome DevTools)

Expo Go에서는 제한적이지만, 개발 빌드에서는 사용 가능:

1. 핸드폰에서 앱 실행
2. 디바이스를 흔들어서 개발자 메뉴 열기
3. "Debug" 선택
4. Chrome에서 `chrome://inspect` 열기
5. 디바이스 선택 후 "inspect" 클릭

### 4. React DevTools 사용

React 컴포넌트 구조를 시각적으로 확인:

```bash
npm install -g react-devtools
react-devtools
```

### 5. 로그 확인 팁

- **console.log**: 일반 로그 (터미널에 표시)
- **console.error**: 에러 로그 (빨간색으로 표시)
- **console.warn**: 경고 로그 (노란색으로 표시)

모든 로그는 Expo 개발 서버가 실행 중인 터미널에 표시됩니다.

### 6. 네트워크 요청 디버깅

API 요청을 확인하려면:
- `src/services/api.ts`에서 `console.log` 추가
- 또는 Axios interceptor 사용

## 문제 해결

### 스와이프가 작동하지 않는 경우
- `babel.config.js`에 `react-native-reanimated/plugin`이 포함되어 있는지 확인하세요.
- 앱을 완전히 재시작하세요.

### API 연결 오류
- API 서버 URL이 올바른지 확인하세요.
- 네트워크 연결을 확인하세요.
- CORS 설정을 확인하세요.

### 에러가 터미널에 표시되지 않는 경우
- 서버를 재시작하세요: `npm start -- --clear`
- 핸드폰에서 앱을 완전히 종료하고 다시 열어보세요.
- 터미널 창이 올바른 프로세스를 표시하는지 확인하세요.
