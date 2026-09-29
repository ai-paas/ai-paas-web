// 리전 코드 옆에 지명을 붙인다.
//
// CSP 가 주는 name 필드는 쓸모가 제각각이다 — OCI 는 리전 키(NRT), 어떤 CSP 는
// 코드와 같은 값을 준다. 표시는 화면 사정이므로 매핑은 웹이 갖는다.
//
// 코드는 CSP 마다 다르지만 겹치지 않아 한 표로 둔다.

const REGION_CITY: Record<string, string> = {
  // AWS
  'ap-northeast-1': '도쿄',
  'ap-northeast-2': '서울',
  'ap-northeast-3': '오사카',
  'ap-southeast-1': '싱가포르',
  'ap-southeast-2': '시드니',
  'ap-south-1': '뭄바이',
  'us-east-1': '버지니아',
  'us-east-2': '오하이오',
  'us-west-1': '캘리포니아',
  'us-west-2': '오리건',
  'eu-west-1': '아일랜드',
  'eu-central-1': '프랑크푸르트',
  // GCP
  'asia-northeast1': '도쿄',
  'asia-northeast2': '오사카',
  'asia-northeast3': '서울',
  'asia-southeast1': '싱가포르',
  'us-central1': '아이오와',
  'europe-west1': '벨기에',
  // Alibaba — AWS 와 이름이 겹치는 리전(ap-northeast-2 등)은 위에서 이미 같은 값으로 잡힌다.
  'cn-hangzhou': '항저우',
  'cn-beijing': '베이징',
  'cn-shanghai': '상하이',
  'ap-southeast-5': '자카르타',
  // OCI
  'ap-seoul-1': '서울',
  'ap-chuncheon-1': '춘천',
  'ap-tokyo-1': '도쿄',
  'ap-osaka-1': '오사카',
  'ap-singapore-1': '싱가포르',
  'us-ashburn-1': '애슈번',
  'us-phoenix-1': '피닉스',
  // IBM
  'us-south': '댈러스',
  'us-east': '워싱턴DC',
  'eu-de': '프랑크푸르트',
  'eu-gb': '런던',
  'jp-tok': '도쿄',
  'jp-osa': '오사카',
  'au-syd': '시드니',
  'kr-seo': '서울',
};

/**
 * 리전 코드에 지명을 붙여 표시한다. 모르는 코드는 코드만 돌려준다 —
 * 신규 리전에 `(undefined)` 가 붙으면 안 된다.
 */
export const regionLabel = (regionId?: string | null): string => {
  if (!regionId) return '';
  const city = REGION_CITY[regionId];
  return city ? `${regionId} (${city})` : regionId;
};

/** 지명을 아는 코드인지. */
export const hasRegionCity = (regionId?: string | null): boolean =>
  !!regionId && regionId in REGION_CITY;
