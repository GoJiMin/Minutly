import {LoginRequest} from '../model/schema';
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

export async function fetchAuthCheck() {
  await fetchGet({
    endpoint: '/api/auth/check',
    withResponse: false,
    errorHandlingType: 'silent',
  });
}
