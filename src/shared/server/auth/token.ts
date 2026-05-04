import 'server-only';

import {jwtVerify, SignJWT} from 'jose';
import {accessTokenMaxAgeSeconds, authSubject, refreshTokenMaxAgeSeconds} from './constants';
import {authConfig} from '../env';

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

async function verifyToken<TPayload extends AuthTokenPayload>(
  jwt: string,
  tokenType: AuthTokenType,
): Promise<TPayload | null> {
  const secret = tokenType === 'access' ? accessTokenSecret : refreshTokenSecret;

  try {
    const {payload} = await jwtVerify(jwt, secret, {
      subject: authSubject,
      algorithms: ['HS256'],
    });

    if (payload.tokenType !== tokenType) {
      return null;
    }

    return payload as TPayload;
  } catch {
    return null;
  }
}

export function verifyAccessToken(jwt: string) {
  return verifyToken<AccessTokenPayload>(jwt, 'access');
}

export function verifyRefreshToken(jwt: string) {
  return verifyToken<RefreshTokenPayload>(jwt, 'refresh');
}
