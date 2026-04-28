import {PropsWithChildren} from 'react';
import {ReactQueryProvider} from './ReactQueryProvider';

export function AppProvider({children}: PropsWithChildren) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
