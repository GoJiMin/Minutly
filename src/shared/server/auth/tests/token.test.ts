/**
 * @jest-environment node
 */

import {accessTokenMaxAgeSeconds} from '../constants';
import {issueAccessToken, issueRefreshToken, verifyAccessToken, verifyRefreshToken} from '../token';

describe('@/src/shared/server/auth/token.ts', () => {
  it('액세스 토큰을 발급하고 검증할 수 있다.', async () => {
    const accessToken = await issueAccessToken();
    const result = await verifyAccessToken(accessToken);

    expect(result).toStrictEqual({ok: true});
  });

  it('리프레쉬 토큰을 발급하고 검증할 수 있다.', async () => {
    const refreshToken = await issueRefreshToken();
    const result = await verifyRefreshToken(refreshToken);

    expect(result).toStrictEqual({ok: true});
  });

  it('액세스 토큰은 토큰 재발급 권한으로 인정하지 않는다.', async () => {
    const accessToken = await issueAccessToken();
    const result = await verifyRefreshToken(accessToken);

    expect(result).toStrictEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('리프레쉬 토큰은 보호 API 접근 권한으로 인정하지 않는다.', async () => {
    const refreshToken = await issueRefreshToken();
    const result = await verifyAccessToken(refreshToken);

    expect(result).toStrictEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('만료된 액세스 토큰은 토큰 만료 실패 결과를 반환한다.', async () => {
    const issuedAt = new Date('2026-05-04T00:00:00.000Z');

    jest.useFakeTimers();

    try {
      jest.setSystemTime(issuedAt);

      const accessToken = await issueAccessToken();

      jest.setSystemTime(new Date(issuedAt.getTime() + (accessTokenMaxAgeSeconds + 1) * 1000));

      const result = await verifyAccessToken(accessToken);

      expect(result).toStrictEqual({
        ok: false,
        reason: 'expired',
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('JWT 형식이 아닌 문자열은 유효하지 않은 토큰 실패 결과를 반환한다.', async () => {
    const result = await verifyAccessToken('not-a-jwt');

    expect(result).toStrictEqual({
      ok: false,
      reason: 'invalid',
    });
  });
});
