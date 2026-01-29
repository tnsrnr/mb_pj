// API 설정
// gs_portal 프로덕션 서버 (Vercel 배포)
export const API_BASE_URL = 'https://gs-portal-chi.vercel.app';

// 개발 환경 사용 시 아래 주석 해제:
// export const API_BASE_URL = 'http://localhost:3000';
// Android 에뮬레이터 사용 시:
// export const API_BASE_URL = 'http://10.0.2.2:3000';
// 실제 기기에서 로컬 서버 사용 시:
// export const API_BASE_URL = 'http://192.168.1.100:3000';

// 학습 설정 기본값
export const DEFAULT_CHOICE_COUNT = 3;
export const DEFAULT_STUDY_MODE: 'random' | 'sequential' = 'sequential';
export const DEFAULT_STUDY_PATTERN: 'full' | 'select_definition' | 'find_topic' = 'full';

// 스와이프 임계값
export const SWIPE_THRESHOLD = 100;
