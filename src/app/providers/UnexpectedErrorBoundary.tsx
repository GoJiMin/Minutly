'use client';

import {PropsWithChildren} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import {RetryErrorFallback} from '@/shared/components';

function UnexpectedErrorFallback({resetErrorBoundary}: FallbackProps) {
  return (
    <section role="alert" className="flex min-h-dvh w-full items-center justify-center bg-background">
      <RetryErrorFallback
        title="화면을 불러오지 못했어요."
        message="작성 중이던 회의 제목과 전사 내용이 임시 저장되어 있다면 다시 복구할 수 있어요."
        onRetry={resetErrorBoundary}
        className="w-full"
        contentClassName="min-h-dvh w-full"
        showIcon
        size="page"
      />
    </section>
  );
}

export function UnexpectedErrorBoundary({children}: PropsWithChildren) {
  return <ErrorBoundary fallbackRender={UnexpectedErrorFallback}>{children}</ErrorBoundary>;
}
