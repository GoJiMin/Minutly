type ErrorMessage = Record<string, string>;

export const SERVER_ERROR_MESSAGE: ErrorMessage = {
  /**
   * 공통
   */
  UNAUTHORIZED: '인증이 필요한 기능이에요.',
  TOKEN_EXPIRED: '인증 정보가 만료됐어요. 다시 로그인해주세요.',
  INVALID_REQUEST: '잘못된 요청이에요. 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',

  /**
   * 인증 관련
   */
  // POST /api/auth/login
  INVALID_CREDENTIALS: '로그인 정보가 잘못됐어요. 다시 시도해주세요.',
  AUTH_LOGIN_FAILED: '로그인 처리 중 문제가 발생했어요. 다시 시도해주세요.',

  // POST /api/auth/refresh
  AUTH_REFRESH_FAILED: '인증 정보 갱신에 실패했어요. 다시 시도해주세요.',

  // POST /api/auth/logout
  AUTH_LOGOUT_FAILED: '로그아웃에 실패했어요. 다시 시도해주세요.',

  /**
   * 요약 관련
   */
  // POST /api/summary
  TITLE_REQUIRED: '회의 제목을 입력해주세요.',
  TITLE_TOO_LONG: '회의 제목은 최대 100자 이하로 입력해주세요.',
  TRANSCRIPT_TOO_SHORT: '요약할 회의 내용이 충분하지 않습니다.',
  INVALID_SUMMARY_REQUEST: '요약 요청이 올바르지 않습니다. 다시 확인해주세요.',
  SUMMARY_FAILED: '요약 생성에 실패했습니다. 다시 시도해주세요.',
} as const;
