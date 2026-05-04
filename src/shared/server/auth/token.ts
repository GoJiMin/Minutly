import 'server-only';

import {authSubject} from './constants';

export type AuthTokenType = 'access' | 'refresh';

export type AuthTokenPayload = {
  sub: typeof authSubject;
  tokenType: AuthTokenType;
  iat: number;
  exp: number;
};

export type AccessTokenPayload = AuthTokenPayload & {
  tokenType: 'access';
};

export type RefreshTokenPayload = AuthTokenPayload & {
  tokenType: 'refresh';
};
