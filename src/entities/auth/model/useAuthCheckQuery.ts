import {useQuery} from '@tanstack/react-query';
import {fetchAuthCheck} from '../api/authApi';

export function useAuthCheckQuery() {
  useQuery({
    queryKey: ['auth', 'check'],
    queryFn: fetchAuthCheck,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}
