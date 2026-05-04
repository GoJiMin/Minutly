import 'server-only';

export const authSubject = 'minutly-owner' as const;

export const accessTokenMaxAgeSeconds = 60 * 60; // 1 hour
export const refreshTokenMaxAgeSeconds = 60 * 60 * 24 * 28; // 28 days
