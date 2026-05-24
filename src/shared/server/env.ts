import 'server-only';

type SecretEnvKey =
  | 'DATABASE_URL'
  | 'AZURE_SPEECH_SECRET_KEY'
  | 'AZURE_SPEECH_REGION'
  | 'GEMINI_API_KEY'
  | 'AUTH_LOGIN_ID'
  | 'AUTH_PASSWORD'
  | 'AUTH_ACCESS_TOKEN_SECRET'
  | 'AUTH_REFRESH_TOKEN_SECRET';

function readStringEnv(name: string) {
  return process.env[name]?.trim() ?? '';
}

function readRequiredSecretEnv(key: SecretEnvKey) {
  const value = readStringEnv(key);

  if (!value) {
    throw new Error(`필수 환경 변수가 누락됐습니다 : ${key}`);
  }

  return value;
}

// Minutly의 서버 환경 변수는 모두 required secret이다.
// 서버 필수 환경 변수는 모듈 로드 시점에 검증해 누락시 fast-fail한다.
export const azureConfig = Object.freeze({
  apiKey: readRequiredSecretEnv('AZURE_SPEECH_SECRET_KEY'),
  region: readRequiredSecretEnv('AZURE_SPEECH_REGION'),
});

export const neonConfig = Object.freeze({
  databaseUrl: readRequiredSecretEnv('DATABASE_URL'),
});

export const aiConfig = Object.freeze({
  apiKey: readRequiredSecretEnv('GEMINI_API_KEY'),
});

export const authConfig = Object.freeze({
  id: readRequiredSecretEnv('AUTH_LOGIN_ID'),
  password: readRequiredSecretEnv('AUTH_PASSWORD'),
  accessTokenSecret: readRequiredSecretEnv('AUTH_ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: readRequiredSecretEnv('AUTH_REFRESH_TOKEN_SECRET'),
});
