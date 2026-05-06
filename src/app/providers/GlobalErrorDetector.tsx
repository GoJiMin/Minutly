'use client';

import {useEffect} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {useGlobalError, useResetGlobalError} from '@/entities/error';
import {isPredictableServerError} from '@/shared/api';
import {toast} from '@/shared/components';
import {SERVER_ERROR_MESSAGE} from '@/shared/config/errorMessage';

export function GlobalErrorDetector() {
  const globalError = useGlobalError();
  const resetGlobalError = useResetGlobalError();

  const {showBoundary} = useErrorBoundary();

  useEffect(() => {
    if (!globalError) return;

    if (isPredictableServerError(globalError)) {
      toast.error({
        title: '에러가 발생했어요.',
        description: SERVER_ERROR_MESSAGE[globalError.name],
      });

      resetGlobalError();
      return;
    }

    showBoundary(globalError);
    resetGlobalError();
  }, [globalError, resetGlobalError, showBoundary]);

  return null;
}
