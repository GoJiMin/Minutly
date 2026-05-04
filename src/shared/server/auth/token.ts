import 'server-only';

import {authSubject} from './constants';
import {authConfig} from '../env';
import {SignJWT} from 'jose';

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

const textEncoder = new TextEncoder();

const accessTokenSecret = textEncoder.encode(authConfig.accessTokenSecret);
const refreshTokenSecret = textEncoder.encode(authConfig.refreshTokenSecret);

export async function issueAccessToken() {
  return new SignJWT({tokenType: 'access'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(authSubject)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(accessTokenSecret);
}

export async function issueRefreshToken() {
  return new SignJWT({tokenType: 'refresh'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(authSubject)
    .setIssuedAt()
    .setExpirationTime('28d')
    .sign(refreshTokenSecret);
}
