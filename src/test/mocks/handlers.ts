// 도메인별 핸들러를 합치는 배럴.
// 새 도메인 훅/컴포넌트를 테스트하려면 handlers/<도메인>.ts를 만들어 여기에 합친다.
// (setup-tests.ts가 onUnhandledRequest: 'error'라 핸들러 없는 요청은 테스트가 즉시 실패한다)
import { authHandlers } from './handlers/auth';
import { modelHandlers } from './handlers/models';
import { promptHandlers } from './handlers/prompts';
import { serviceHandlers } from './handlers/services';
import { workflowHandlers } from './handlers/workflows';

export { BASE_URL } from './handlers/base';
export { mockCustomModels, mockModelCatalogs } from './handlers/models';
export { mockPrompts } from './handlers/prompts';
export { mockServices, mockServiceDetail } from './handlers/services';
export { mockWorkflow } from './handlers/workflows';

export const handlers = [
  ...authHandlers,
  ...modelHandlers,
  ...promptHandlers,
  ...serviceHandlers,
  ...workflowHandlers,
];
