/**
 * @jest-environment node
 */

import {cookies} from 'next/headers';
import {verifyAccessToken} from '../token';
import {authCookieNames} from '../constants';
import {requireAuth} from '../require-auth';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../token', () => ({
  verifyAccessToken: jest.fn(),
}));

const mockedCookies = jest.mocked(cookies);
const mockedVerifyAccessToken = jest.mocked(verifyAccessToken);

function mockCookieStore(values: Record<string, string>) {
  mockedCookies.mockResolvedValue({
    get: jest.fn((name: string) => {
      const value = values[name];

      if (!value) {
        return undefined;
      }

      return {
        name,
        value,
      };
    }),
  } as unknown as Awaited<ReturnType<typeof cookies>>);
}

describe('@/src/shared/server/auth/require-auth.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('액세스 토큰과 리프레쉬 토큰이 모두 없다면 AUTH_REQUIRED 에러를 반환한다.', async () => {
    mockCookieStore({});

    const result = await requireAuth();

    expect(mockedVerifyAccessToken).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Excepted auth failure');
    }

    await expect(result.error.json()).resolves.toEqual({
      title: 'AUTH_REQUIRED',
      detail: '인증이 필요합니다.',
      status: 401,
    });
  });

  it('액세스 토큰이 없지만 리프레쉬 토큰이 있다면 TOKEN_EXPIRED 에러를 반환한다.', async () => {
    mockCookieStore({
      [authCookieNames.refreshToken]: 'refresh-token',
    });

    const result = await requireAuth();

    expect(mockedVerifyAccessToken).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Excepted auth failure');
    }

    await expect(result.error.json()).resolves.toEqual({
      title: 'TOKEN_EXPIRED',
      detail: '인증 토큰이 만료되었습니다.',
      status: 401,
    });
  });

  it('액세스 토큰 검증에 성공하면 인증 성공 결과를 반환한다.', async () => {
    mockCookieStore({
      [authCookieNames.accessToken]: 'access-token',
    });

    mockedVerifyAccessToken.mockResolvedValue({ok: true});

    const result = await requireAuth();

    expect(result.ok).toBe(true);
  });

  it('액세스 토큰이 만료되었으면 TOKEN_EXPIRED 에러를 반환한다.', async () => {
    mockCookieStore({
      [authCookieNames.accessToken]: 'expired-access-token',
    });

    mockedVerifyAccessToken.mockResolvedValue({ok: false, reason: 'expired'});

    const result = await requireAuth();

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Excepted auth failure');
    }

    await expect(result.error.json()).resolves.toEqual({
      title: 'TOKEN_EXPIRED',
      detail: '인증 토큰이 만료되었습니다.',
      status: 401,
    });
  });

  it('액세스 토큰이 유효하지 않으면 UNAUTHORIZED 에러를 반환한다.', async () => {
    mockCookieStore({
      [authCookieNames.accessToken]: 'expired-access-token',
    });

    mockedVerifyAccessToken.mockResolvedValue({ok: false, reason: 'invalid'});

    const result = await requireAuth();

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Excepted auth failure');
    }

    await expect(result.error.json()).resolves.toEqual({
      title: 'UNAUTHORIZED',
      detail: '인증이 필요합니다.',
      status: 401,
    });
  });
});
