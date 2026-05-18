import {PropsWithChildren} from 'react';
import {AuthBootstrapper} from '@/features/auth';
import {AppHeader} from './AppHeader';

export function ProtectedLayout({children}: PropsWithChildren) {
  return (
    <>
      <AuthBootstrapper />
      <div className="min-h-dvh flex flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
