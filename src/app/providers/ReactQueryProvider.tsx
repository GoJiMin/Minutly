'use client';

import {PropsWithChildren, useState} from 'react';
import {MutationCache, QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useUpdateGlobalError} from '@/entities/error';
import {RequestError, RequestGetError} from '@/shared/api';

export function ReactQueryProvider({children}: PropsWithChildren) {
  const updateError = useUpdateGlobalError();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,

            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 7,

            retry: 0,

            throwOnError: error => error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary',
          },
        },

        queryCache: new QueryCache({
          onError(error) {
            if (error instanceof RequestGetError) {
              if (error.errorHandlingType === 'toast') {
                updateError(error);
              } else {
                return;
              }
            }
          },
        }),

        mutationCache: new MutationCache({
          onError(error) {
            if (error instanceof RequestError) updateError(error);
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
