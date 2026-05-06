import {PropsWithChildren} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

export function UnexpectedErrorBoundary({children}: PropsWithChildren) {
  return <ErrorBoundary fallback={<div>{/* TODO: 대체 UI 구현 */}</div>}>{children}</ErrorBoundary>;
}
