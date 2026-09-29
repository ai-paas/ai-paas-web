/**
 * 검증용 도구를 여는 스위치.
 *
 * <p>토큰은 번들에 들어가므로 접근 통제가 아니라 숨김이다. 이 스위치가 여는 화면은 이미 인증이
 * 걸린 생성 API 를 호출할 뿐이라, 토큰을 아는 것만으로 새로 할 수 있는 일은 없다. 실제 방어선은
 * 서버 권한이고 여기는 "평소에 보이지 않게" 하는 장치다.
 */
const TOKEN = 'anycloud-e2e';

const STORAGE_KEY = 'anycloud.devTools';

export const DEV_TOOLS_PARAM = 'devTools';

/**
 * 주소의 쿼리를 확인해 스위치를 켠다.
 *
 * <p>한 번 켜면 세션 동안 유지한다 — 목록에서 상세로 갔다 오면 쿼리가 사라지는데, 그때마다
 * 주소를 다시 붙이게 하면 쓸 수 없다.
 */
export const syncDevToolsFromUrl = (search: string): boolean => {
  const token = new URLSearchParams(search).get(DEV_TOOLS_PARAM);
  if (token === TOKEN) {
    sessionStorage.setItem(STORAGE_KEY, TOKEN);
    return true;
  }
  return isDevToolsEnabled();
};

export const isDevToolsEnabled = (): boolean => sessionStorage.getItem(STORAGE_KEY) === TOKEN;

export const disableDevTools = (): void => sessionStorage.removeItem(STORAGE_KEY);
