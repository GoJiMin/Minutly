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

// 서버 필수 환경 변수는 모듈 로드 시점에 검증해 누락시 fast-fail한다.
// 선택 환경 변수는 빈 문자열로 읽고, 사용처에서 필요한 형식으로 해석한다.
export const azureConfig = Object.freeze({
  apiKey: readRequiredSecretEnv('AZURE_SPEECH_SECRET_KEY'),
  region: readRequiredSecretEnv('AZURE_SPEECH_REGION'),
  phrasesText: readStringEnv('AZURE_SPEECH_PHRASES'),
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
