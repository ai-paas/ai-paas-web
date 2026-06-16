/**
 * 클립보드 복사 유틸.
 * navigator.clipboard 를 사용하되, 사용할 수 없는 환경(비보안 컨텍스트 등)에서는
 * textarea + execCommand 폴백으로 복사한다.
 * @returns 복사 성공 여부
 */
export const copyTextToClipboard = async (value: string): Promise<boolean> => {
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return fallbackCopyText(value);
    }
  }

  return fallbackCopyText(value);
};

const fallbackCopyText = (value: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};
