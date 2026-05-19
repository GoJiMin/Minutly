import {PropsWithChildren} from 'react';
import {AuthBootstrapper} from '@/features/auth';
import {AppHeader} from './AppHeader';

export function ProtectedLayout({children}: PropsWithChildren) {
  return (
    <>
      <AuthBootstrapper />
      <div className="h-dvh min-h-0 flex flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </>
  );
}
