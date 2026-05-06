import {PropsWithChildren} from 'react';
import {Toaster as SonnerToaster} from 'sonner';
import {ReactQueryProvider} from './ReactQueryProvider';
import {GlobalErrorDetector} from './GlobalErrorDetector';
import {UnexpectedErrorBoundary} from './UnexpectedErrorBoundary';
import {AuthBootstrapper} from '@/features/auth';

export function AppProvider({children}: PropsWithChildren) {
  return (
    <UnexpectedErrorBoundary>
      <ReactQueryProvider>
        <AuthBootstrapper />
        <SonnerToaster
          position="top-center"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
          toastOptions={{
            style: {width: 'fit-content'},
          }}
          duration={4000}
          visibleToasts={4}
        />
        <GlobalErrorDetector />
        {children}
      </ReactQueryProvider>
    </UnexpectedErrorBoundary>
  );
}
