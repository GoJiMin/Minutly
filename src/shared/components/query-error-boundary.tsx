'use client';

import type {ReactNode} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {Button} from './button';
import {Text} from './typography';
import {RequestGetError} from '@/shared/api';
import {SERVER_ERROR_MESSAGE} from '@/shared/config/errorMessage';
import {cn} from '@/shared/utils/cn';

type QueryErrorBoundaryFallbackProps = {
  message: string;
  reset: () => void;
};

type QueryErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: QueryErrorBoundaryFallbackProps) => ReactNode;
  resetKeys?: unknown[];
};

type QueryErrorFallbackProps = {
  title: ReactNode;
  message: ReactNode;
  onRetry: () => void;
  className?: string;
  contentClassName?: string;
  retryLabel?: string;
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

function QueryErrorFallback({
  title,
  message,
  onRetry,
  className,
  contentClassName,
  retryLabel = '다시 시도',
}: QueryErrorFallbackProps) {
  return (
    <div className={className}>
      <div className={cn('flex flex-col items-center justify-center gap-3 px-6 text-center', contentClassName)}>
        <div className="space-y-1">
          <Text className="font-medium">{title}</Text>
          <Text variant="muted" className="text-sm">
            {message}
          </Text>
        </div>

        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

export {QueryErrorBoundary, QueryErrorFallback};
export type {QueryErrorBoundaryFallbackProps, QueryErrorBoundaryProps, QueryErrorFallbackProps};
