import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const SIDEBAR_MIN_WIDTH = 52;
const SIDEBAR_MAX_WIDTH = 304;
const SIDEBAR_DEFAULT_WIDTH = 232;
const RESIZE_HANDLE_WIDTH = 10;

type SidebarContextProps = {
  isHovered: boolean;
  isPinned: boolean;
  width: number;
  isResizing: boolean;
  setIsHovered: (isHovered: boolean) => void;
  togglePin: () => void;
  setWidth: (width: number) => void;
  setIsResizing: (resizing: boolean) => void;
  startResize: (e: React.MouseEvent) => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.');

  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export const SidebarProvider = ({
  children,
  minWidth = SIDEBAR_MIN_WIDTH,
  maxWidth = SIDEBAR_MAX_WIDTH,
  defaultWidth = SIDEBAR_DEFAULT_WIDTH,
}: SidebarProviderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const togglePin = () => {
    setIsPinned(!isPinned);
    setIsHovered(false);
  };

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = Math.min(Math.max(startWidth + (e.clientX - startX), minWidth), maxWidth);
        setWidth(newWidth);
      };

      const handleMouseUp = (e: MouseEvent) => {
        setIsResizing(false);

        // 리사이즈 종료 후 마우스가 사이드바 영역에 있는지 확인
        const sidebarElement = document.querySelector('[data-sidebar]');
        if (sidebarElement) {
          const rect = sidebarElement.getBoundingClientRect();
          const isMouseInSidebar =
            e.clientX >= rect.left &&
            e.clientX <= rect.right + RESIZE_HANDLE_WIDTH &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          setIsHovered(isMouseInSidebar);
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, minWidth, maxWidth]
  );

  const contextValue: SidebarContextProps = {
    isHovered,
    isPinned,
    width,
    isResizing,
    setIsHovered,
    togglePin,
    setWidth,
    setIsResizing,
    startResize,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex">{children}</div>
    </SidebarContext.Provider>
  );
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Sidebar = ({ children, ...props }: SidebarProps) => {
  const { isPinned, isHovered, width, isResizing, startResize, setIsHovered } = useSidebar();

  const handleMouseEnter = useCallback(() => {
    if (!isPinned) {
      setIsHovered(true);
    }
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (!isPinned) {
      setIsHovered(false);
    }
  }, [isPinned]);

  const currentWidth = isPinned || isHovered ? width : SIDEBAR_MIN_WIDTH;

  return (
    <div
      data-sidebar
      data-width={currentWidth}
      data-pinned={isPinned}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group/sidebar fixed top-[60px] left-0 z-50 h-[calc(100vh-60px)] border-r border-[#e8e8e8] bg-[#f9f9f9] transition-[width_0.1s_ease-in-out] ${isPinned || isHovered ? 'w-[232px]' : 'w-[52px]'}`}
      style={{
        width: `${currentWidth}px`,
        transition: isResizing ? 'none' : 'width 0.1s ease-in-out',
      }}
    >
      <nav
        className="size-full overflow-y-scroll p-1.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        {...props}
      >
        {children}
      </nav>
      {(isPinned || isHovered) && (
        <div
          className="group/resize absolute top-0 -right-2.5 h-full w-2.5 cursor-col-resize transition-colors duration-200"
          onMouseDown={startResize}
        >
          <div className="h-full w-0.5 bg-transparent group-hover/resize:bg-[#b8b8b8] group-active/resize:bg-[#b8b8b8]" />
        </div>
      )}
      {isResizing && <div className="fixed inset-0 z-10 cursor-col-resize" />}
    </div>
  );
};

export const SidebarPin = () => {
  const { isPinned, togglePin } = useSidebar();

  return (
    <button
      onClick={togglePin}
      aria-label={isPinned ? '사이드바 고정 해제' : '사이드바 고정'}
      className={`absolute top-4 -right-2.5 z-20 hidden size-5 rounded-[50%] border border-[#CFCFCF] bg-white transition-[opacity_0.3s_ease-in-out] group-hover/sidebar:block hover:border-[#1a1a1a] hover:!bg-[#1a1a1a] hover:[&>i]:border-white`}
    >
      <i
        className={`mr-0.5 mb-0.5 inline-block size-[5px] -rotate-45 transform border-r border-b border-[#999] ${isPinned ? 'mb-0.5 ml-1 rotate-[135deg]' : ''}`}
      />
    </button>
  );
};

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SidebarInset = ({ children, ...props }: SidebarInsetProps) => {
  const { isPinned, width, isResizing } = useSidebar();

  return (
    <div
      className={`relative z-0 mt-[60px] size-full min-w-[1700px]`}
      style={{
        marginLeft: `${isPinned ? width : SIDEBAR_MIN_WIDTH}px`,
        transition: isResizing ? 'none' : 'width 0.1s ease-in-out',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
