import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import './assets/font/pretendardvariable.css';
import './assets/style/index.scss';
import { router } from './router/router.tsx';

import ErrorBoundary from './components/layout/error-boundary.tsx';
import { InnogridUIProvider, ToastProvider } from '@innogrid/ui';
import { ReactQueryProvider } from './components/provider/react-query-provider.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InnogridUIProvider language={'ko'} theme={'cloudit'}>
      <ErrorBoundary>
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </ErrorBoundary>
    </InnogridUIProvider>
  </StrictMode>
);
