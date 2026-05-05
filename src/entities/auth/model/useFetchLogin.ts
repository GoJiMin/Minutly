import {useRouter} from 'next/navigation';
import {useMutation} from '@tanstack/react-query';
import {fetchLogin} from '../api/authApi';

export function useFetchLogin() {
  const router = useRouter();

  const {mutate, isPending} = useMutation({
    mutationFn: fetchLogin,
    onSuccess: () => {
      router.replace('/');
    },
  });

  return {
    login: mutate,
    isPendingLogin: isPending,
  };
}
