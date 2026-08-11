// jsdom 기본 location(http://localhost:3000) + ky prefixUrl('/api/v1') 기준.
// setup-tests.ts의 상대 URL 절대화 패치가 이 주소로 요청을 보낸다.
// 테스트 내 server.use() 오버라이드에서도 이 상수를 사용할 것 (하드코딩 금지).
export const BASE_URL = 'http://localhost:3000/api/v1';
