import '@testing-library/jest-dom';
import 'whatwg-fetch';

jest.mock('next/navigation', () => jest.requireActual('next-router-mock/navigation'));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({priority, fill, ...props}: {priority: boolean; fill: boolean}) => (
    <img {...props} loading={priority ? 'eager' : 'lazy'} className={fill ? 'absolute' : 'static'} />
  ),
}));

if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.setPointerCapture = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

process.env.DATABASE_URL = 'postgresql://test-user:test-password@localhost:5432/test-db';
process.env.AZURE_SPEECH_SECRET_KEY = 'test-azure-speech-secret-key';
process.env.AZURE_SPEECH_REGION = 'koreacentral';
process.env.AZURE_SPEECH_API_ENDPOINT = 'https://test-speech.example.com';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';
process.env.AUTH_LOGIN_ID = 'test-login-id';
process.env.AUTH_PASSWORD = 'test-password';
process.env.AUTH_ACCESS_TOKEN_SECRET = 'test-access-token-secret';
process.env.AUTH_REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
