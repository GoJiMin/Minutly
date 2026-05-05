import {LoginRequest} from '../model/schema';
import {AuthMeResponse} from '../model/types';
import {fetchGet, fetchPost} from '@/shared/api';

export function fetchLogin(input: LoginRequest) {
  fetchPost({
    endpoint: '/api/auth/login',
    body: input,
  });
}

export function fetchLogout() {
  fetchPost({
    endpoint: '/api/auth/logout',
  });
}

export function fetchTokenRefresh() {
  fetchPost({
    endpoint: '/api/auth/refresh',
  });
}

export function fetchAuthMe() {
  return fetchGet<AuthMeResponse>({
    endpoint: '/api/auth/me',
    errorHandlingType: 'silent',
  });
}
