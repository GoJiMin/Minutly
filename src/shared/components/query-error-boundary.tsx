'use client';

import type {ReactNode} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {RequestGetError} from '@/shared/api';
import {SERVER_ERROR_MESSAGE} from '@/shared/config/errorMessage';

type QueryErrorBoundaryFallbackProps = {
  message: string;
  reset: () => void;
};

type QueryErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: QueryErrorBoundaryFallbackProps) => ReactNode;
  resetKeys?: unknown[];
};

function getQueryErrorMessage(error: unknown) {
  if (error instanceof RequestGetError && SERVER_ERROR_MESSAGE[error.name]) {
    return SERVER_ERROR_MESSAGE[error.name];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

function QueryErrorBoundary({children, fallback, resetKeys}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary
          fallbackRender={({error, resetErrorBoundary}: FallbackProps) =>
            fallback({
              message: getQueryErrorMessage(error),
              reset: resetErrorBoundary,
            })
          }
          onReset={reset}
          resetKeys={resetKeys}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export {QueryErrorBoundary};
export type {QueryErrorBoundaryFallbackProps, QueryErrorBoundaryProps};
