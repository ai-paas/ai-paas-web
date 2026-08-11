// 도메인별 핸들러를 합치는 배럴.
// 새 도메인 훅/컴포넌트를 테스트하려면 handlers/<도메인>.ts를 만들어 여기에 합친다.
// (setup-tests.ts가 onUnhandledRequest: 'error'라 핸들러 없는 요청은 테스트가 즉시 실패한다)
import { authHandlers } from './handlers/auth';
import { serviceHandlers } from './handlers/services';

export { BASE_URL } from './handlers/base';
export { mockServices, mockServiceDetail } from './handlers/services';

export const handlers = [...authHandlers, ...serviceHandlers];
