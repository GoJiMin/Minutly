import {PropsWithChildren} from 'react';
import {ReactQueryProvider} from './ReactQueryProvider';
import {AuthBootstrapper} from '@/features/auth';

export function AppProvider({children}: PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <AuthBootstrapper />
      {children}
    </ReactQueryProvider>
  );
}
