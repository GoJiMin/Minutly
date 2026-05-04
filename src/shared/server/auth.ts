export const authSubjext = 'minutly-owner' as const;

export type AuthTokenType = 'access' | 'refresh';

export type AuthTokenPayload = {
  sub: typeof authSubjext;
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
