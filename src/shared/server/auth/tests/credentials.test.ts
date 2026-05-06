import {verifyCredentials} from '../credentials';

describe('@/src/shared/server/auth/credentials.ts', () => {
  it('id와 password가 모두 일치하면 true를 반환한다.', () => {
    expect(
      verifyCredentials({
        id: 'test-login-id',
        password: 'test-password',
      }),
    ).toBe(true);
  });

  it('id가 일치하지 않으면 false를 반환한다.', () => {
    expect(
      verifyCredentials({
        id: 'wrong-login-id',
        password: 'test-password',
      }),
    ).toBe(false);
  });

  it('password가 일치하지 않으면 false를 반환한다.', () => {
    expect(
      verifyCredentials({
        id: 'test-login-id',
        password: 'wrong-password',
      }),
    ).toBe(false);
  });

  it('id와 password가 모두 일치하지 않으면 false를 반환한다.', () => {
    expect(
      verifyCredentials({
        id: 'wrong-login-id',
        password: 'wrong-password',
      }),
    ).toBe(false);
  });
});
