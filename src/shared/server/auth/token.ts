import 'server-only';

import {jwtVerify, SignJWT} from 'jose';
import {accessTokenMaxAgeSeconds, authSubject, refreshTokenMaxAgeSeconds} from './constants';
import {authConfig} from '../env';
import {JWTExpired} from 'jose/errors';

export type AuthTokenType = 'access' | 'refresh';
export type VerifyTokenFailureReason = 'expired' | 'invalid';
export type VerifyTokenResult = {ok: true} | {ok: false; reason: VerifyTokenFailureReason};

const textEncoder = new TextEncoder();

const accessTokenSecret = textEncoder.encode(authConfig.accessTokenSecret);
const refreshTokenSecret = textEncoder.encode(authConfig.refreshTokenSecret);

export async function issueAccessToken() {
  return new SignJWT({tokenType: 'access'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(authSubject)
    .setIssuedAt()
    .setExpirationTime(`${accessTokenMaxAgeSeconds}s`)
    .sign(accessTokenSecret);
}

export async function issueRefreshToken() {
  return new SignJWT({tokenType: 'refresh'})
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(authSubject)
    .setIssuedAt()
    .setExpirationTime(`${refreshTokenMaxAgeSeconds}s`)
    .sign(refreshTokenSecret);
}

async function verifyToken(jwt: string, tokenType: AuthTokenType): Promise<VerifyTokenResult> {
  const secret = tokenType === 'access' ? accessTokenSecret : refreshTokenSecret;

  try {
    const {payload} = await jwtVerify(jwt, secret, {
      subject: authSubject,
      algorithms: ['HS256'],
    });

    if (payload.tokenType !== tokenType) {
      return {ok: false, reason: 'invalid'};
    }

    return {ok: true};
  } catch (error) {
    if (error instanceof JWTExpired) {
      return {ok: false, reason: 'expired'};
    }

    return {ok: false, reason: 'invalid'};
  }
}

export function verifyAccessToken(jwt: string) {
  return verifyToken(jwt, 'access');
}

export function verifyRefreshToken(jwt: string) {
  return verifyToken(jwt, 'refresh');
}
