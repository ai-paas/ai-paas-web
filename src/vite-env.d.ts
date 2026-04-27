/// <reference types="vite/client" />

declare module '*.svg' {
  import type * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string; titleId?: string; desc?: string; descId?: string }
  >;

  export default ReactComponent;
}

declare module 'react-lottie' {
  import type * as React from 'react';

  interface LottieOptions {
    loop?: boolean;
    autoplay?: boolean;
    animationData: unknown;
    rendererSettings?: {
      preserveAspectRatio?: string;
    };
  }

  interface LottieProps {
    options: LottieOptions;
    height?: number | string;
    width?: number | string;
    isStopped?: boolean;
    isPaused?: boolean;
    speed?: number;
    style?: React.CSSProperties;
    isClickToPauseDisabled?: boolean;
    title?: string;
    ariaRole?: string;
    ariaLabel?: string;
    eventListeners?: Array<{ eventName: string; callback: () => void }>;
  }

  const Lottie: React.ComponentType<LottieProps>;
  export default Lottie;
}
