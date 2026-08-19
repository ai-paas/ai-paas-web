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
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
      errMessage?: string;
      customSize?: { width?: number; height?: number };
    }
  >(({ errMessage, customSize, ...props }, ref) => (
    <>
      <textarea
        ref={ref}
        style={customSize ? { width: customSize.width, height: customSize.height } : undefined}
        {...props}
      />
      {errMessage && <span>{errMessage}</span>}
    </>
  ));
  Textarea.displayName = 'Textarea';

  // PopoverTrigger 등 radix asChild가 ref를 전달하므로 forwardRef로 구현한다.
  const Button = forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string; size?: string }
  >(({ children, color, size, ...props }, ref) => (
    <button ref={ref} data-color={color} data-size={size} {...props}>
      {children}
    </button>
  ));
  Button.displayName = 'Button';

  return {
    Button,

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

    // 옵션을 네이티브 select로 렌더링하는 경량 목 — 검색·메뉴 포지셔닝 로직은 생략.
    // placeholder를 aria-label로 노출하므로 getByRole('combobox') 또는 getByLabelText로 조회한다.
    Select: ({
      options = [],
      value,
      placeholder,
      onChange,
      getOptionLabel = (option) => String((option as { text?: unknown })?.text ?? ''),
      getOptionValue = (option) => String((option as { value?: unknown })?.value ?? ''),
    }: {
      options?: unknown[];
      value?: unknown;
      placeholder?: string;
      onChange?: (option: unknown | null) => void;
      getOptionLabel?: (option: unknown) => string;
      getOptionValue?: (option: unknown) => string;
      menuPosition?: string;
    }) => (
      <select
        aria-label={placeholder}
        value={value != null ? getOptionValue(value) : ''}
        onChange={(event) => {
          const selected =
            options.find((option) => getOptionValue(option) === event.target.value) ?? null;
          onChange?.(selected);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    ),

    // 네이티브 라디오로 렌더링하는 경량 목 — label 텍스트로 getByRole('radio', { name })이 동작한다.
    RadioGroupButton: ({
      id,
      options = [],
      value,
      onValueChange,
    }: {
      id?: string;
      orientation?: string;
      options?: { label: string; value: string }[];
      value?: string;
      onValueChange?: (value: string) => void;
    }) => (
      <div role="radiogroup">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={id}
              checked={option.value === value}
              onChange={() => onValueChange?.(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    ),

    // 배열 value([number]) 규약만 유지한 네이티브 range 목
    Slider: ({
      value,
      onValueChange,
      min,
      max,
      step,
    }: {
      value?: number[];
      onValueChange?: (value: number[]) => void;
      min?: number;
      max?: number;
      step?: number;
    }) => (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value?.[0] ?? 0}
        onChange={(event) => onValueChange?.([Number(event.target.value)])}
      />
    ),

    // 모든 아이템을 펼친 상태로 렌더링하는 경량 목 — 접기/펼치기 상태 로직은 생략
    Accordion: ({
      components = [],
    }: {
      components?: { label: React.ReactNode; component: React.ReactNode }[];
      defaultValue?: string;
    }) => (
      <div>
        {components.map((item, i) => (
          <div key={i}>
            <div>{item.label}</div>
            {item.component}
          </div>
        ))}
      </div>
    ),

    // 트리거와 메뉴 아이템을 항상 렌더링하는 경량 목 — open/onOpenChange 상태 로직은 생략
    DropdownMenu: ({
      children,
      menus,
    }: {
      children: React.ReactNode;
      menus: {
        label: React.ReactNode;
        onSelect?: (event: Event) => void;
        disabled?: boolean;
      }[];
    }) => (
      <div>
        {children}
        <div role="menu">
          {menus.map((menu, i) => (
            <button
              key={i}
              role="menuitem"
              disabled={menu.disabled}
              onClick={() => menu.onSelect?.(new Event('select'))}
            >
              {menu.label}
            </button>
          ))}
        </div>
      </div>
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

    useToast: () => ({ open: vi.fn() }),
  };
});
