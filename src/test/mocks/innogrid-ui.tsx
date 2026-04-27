import { vi } from 'vitest';

// @innogrid/ui 컴포넌트 모킹
vi.mock('@innogrid/ui', () => ({
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

  Input: ({
    name,
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),

  Textarea: ({
    name,
    value,
    onChange,
    placeholder,
  }: {
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
  }) => (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),

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
}));
