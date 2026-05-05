import {LoginRequest} from '../model/schema';
import {AuthMeResponse} from '../model/types';
import {fetchGet, fetchPost} from '@/shared/api';

export async function fetchLogin(input: LoginRequest) {
  await fetchPost({
    endpoint: '/api/auth/login',
    body: input,
  });
}

export async function fetchLogout() {
  await fetchPost({
    endpoint: '/api/auth/logout',
  });
}

export async function fetchTokenRefresh() {
  await fetchPost({
    endpoint: '/api/auth/refresh',
  });
}

export async function fetchAuthMe() {
  return await fetchGet<AuthMeResponse>({
    endpoint: '/api/auth/me',
    errorHandlingType: 'silent',
  });
}
