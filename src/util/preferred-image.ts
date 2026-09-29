/**
 * 검증한 기본 이미지.
 *
 * <p>목록은 최신순이라 그냥 첫 값을 쓰면 갓 나온 릴리스가 잡힌다. 부트스트랩이 설치하는
 * kubeadm 패키지가 그 버전에 올라와 있다는 보장이 없다. 백엔드의 기본값 조립도 같은 기준이다.
 */
export const PREFERRED_OS = 'Ubuntu 24.04';

/** {@code ubuntu-24.04}, {@code ubuntu_24_04}, {@code Canonical-Ubuntu-24.04} 를 모두 같게 본다. */
const matches = (label: string): boolean => {
  const normalized = label.toLowerCase().replace(/[_.]/g, '-');
  return normalized.includes('ubuntu') && normalized.includes('24-04') && !normalized.includes('arm');
};

export const preferredImage = <T extends { text?: string; value: string }>(
  options: T[]
): T | undefined => options.find((option) => matches(option.text ?? option.value));
