import { describe, it, expect, afterEach, vi } from 'vitest';
import { copyTextToClipboard } from './clipboard';

// jsdom 에는 navigator.clipboard 와 document.execCommand 가 없으므로
// 테스트마다 스텁을 정의하고 afterEach 에서 원래 상태로 복원한다.
const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');

const defineClipboard = (clipboard: unknown) => {
  Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
};

const stubExecCommand = (impl: (commandId: string) => boolean) => {
  const execCommand = vi.fn(impl);
  Object.defineProperty(document, 'execCommand', {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
};

describe('copyTextToClipboard', () => {
  afterEach(() => {
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard;
    }

    if (originalExecCommandDescriptor) {
      Object.defineProperty(document, 'execCommand', originalExecCommandDescriptor);
    } else {
      delete (document as { execCommand?: unknown }).execCommand;
    }

    document.body.innerHTML = '';
  });

  // ============================================
  // 빈 문자열 처리
  // ============================================
  describe('빈 문자열', () => {
    it('빈 문자열이면 false를 반환하고 writeText를 호출하지 않는다', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      defineClipboard({ writeText });
      const execCommand = stubExecCommand(() => true);

      const result = await copyTextToClipboard('');

      expect(result).toBe(false);
      expect(writeText).not.toHaveBeenCalled();
      expect(execCommand).not.toHaveBeenCalled();
      expect(document.body.querySelector('textarea')).toBeNull();
    });
  });

  // ============================================
  // navigator.clipboard 경로
  // ============================================
  describe('navigator.clipboard 경로', () => {
    it('writeText가 성공하면 true를 반환한다', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      defineClipboard({ writeText });

      const result = await copyTextToClipboard('복사할 텍스트');

      expect(result).toBe(true);
      expect(writeText).toHaveBeenCalledExactlyOnceWith('복사할 텍스트');
      expect(document.body.querySelector('textarea')).toBeNull();
    });

    it('writeText가 reject되면 execCommand 폴백으로 복사한다', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
      defineClipboard({ writeText });
      const execCommand = stubExecCommand(() => true);

      const result = await copyTextToClipboard('복사할 텍스트');

      expect(result).toBe(true);
      expect(writeText).toHaveBeenCalledExactlyOnceWith('복사할 텍스트');
      expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy');
    });
  });

  // ============================================
  // execCommand 폴백 경로
  // ============================================
  describe('execCommand 폴백 경로', () => {
    it('navigator.clipboard가 없으면 writeText 없이 바로 폴백을 사용한다', async () => {
      defineClipboard(undefined);
      const execCommand = stubExecCommand(() => true);

      const result = await copyTextToClipboard('복사할 텍스트');

      expect(result).toBe(true);
      expect(execCommand).toHaveBeenCalledExactlyOnceWith('copy');
    });

    it.each([
      { execResult: true, expected: true },
      { execResult: false, expected: false },
    ])(
      'execCommand가 $execResult를 반환하면 $expected를 반환한다',
      async ({ execResult, expected }) => {
        defineClipboard(undefined);
        stubExecCommand(() => execResult);

        await expect(copyTextToClipboard('복사할 텍스트')).resolves.toBe(expected);
      }
    );

    it('execCommand가 예외를 던지면 false를 반환한다', async () => {
      defineClipboard(undefined);
      stubExecCommand(() => {
        throw new Error('execCommand not supported');
      });

      await expect(copyTextToClipboard('복사할 텍스트')).resolves.toBe(false);
    });

    it.each([
      {
        label: '성공(true 반환)',
        impl: () => true,
        expected: true,
      },
      {
        label: '실패(false 반환)',
        impl: () => false,
        expected: false,
      },
      {
        label: '예외 발생',
        impl: (): boolean => {
          throw new Error('execCommand failed');
        },
        expected: false,
      },
    ])('execCommand $label 시에도 textarea가 body에서 제거된다', async ({ impl, expected }) => {
      defineClipboard(undefined);
      let textareaValueDuringCopy: string | undefined;
      stubExecCommand(() => {
        // 복사 시점에는 값이 채워진 textarea가 body에 존재해야 한다.
        textareaValueDuringCopy = document.body.querySelector('textarea')?.value;
        return impl();
      });

      const result = await copyTextToClipboard('복사할 텍스트');

      expect(result).toBe(expected);
      expect(textareaValueDuringCopy).toBe('복사할 텍스트');
      expect(document.body.querySelector('textarea')).toBeNull();
    });
  });
});
