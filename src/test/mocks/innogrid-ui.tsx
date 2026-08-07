import { vi } from 'vitest';

// @innogrid/ui 컴포넌트 모킹
// Input/Textarea는 react-hook-form의 {...register()}가 넘기는 ref/onBlur가 동작해야
// reset()으로 채운 값이 DOM에 반영되므로 forwardRef + props 스프레드로 구현한다.
vi.mock('@innogrid/ui', async () => {
  const { forwardRef } = await import('react');

  const Input = forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { errMessage?: string }
  >(({ errMessage, ...props }, ref) => (
    <>
      <input ref={ref} {...props} />
      {errMessage && <span>{errMessage}</span>}
    </>
  ));
  Input.displayName = 'Input';

  const Textarea = forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & { errMessage?: string }
  >(({ errMessage, ...props }, ref) => (
    <>
      <textarea ref={ref} {...props} />
      {errMessage && <span>{errMessage}</span>}
    </>
  ));
  Textarea.displayName = 'Textarea';

  return {
    Button: ({
      children,
      onClick,
      disabled,
      color,
      size,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      color?: string;
      size?: string;
    }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-color={color}
        data-size={size}
      >
        {children}
      </button>
    ),

    Modal: ({
      isOpen,
      children,
      title,
      action,
      buttonTitle,
      subButton,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
      title: string;
      action?: () => void;
      onRequestClose?: () => void;
      buttonTitle?: string;
      subButton?: React.ReactNode;
    }) =>
      isOpen ? (
        <div role="dialog" aria-label={title}>
          <h2>{title}</h2>
          {children}
          <div>
            {subButton}
            <button onClick={action}>{buttonTitle}</button>
          </div>
        </div>
      ) : null,

    Input,

    Textarea,

    AlertDialog: ({
      isOpen,
      children,
      confirmButtonText,
      cancelButtonText,
      onClickConfirm,
      onClickClose,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
      confirmButtonText?: string;
      cancelButtonText?: string;
      onClickConfirm?: () => void;
      onClickClose?: () => void;
    }) =>
      isOpen ? (
        <div role="alertdialog">
          {children}
          <button onClick={onClickClose}>{cancelButtonText}</button>
          <button onClick={onClickConfirm}>{confirmButtonText}</button>
        </div>
      ) : null,

    useToast: () => ({ open: vi.fn() }),
  };
});
