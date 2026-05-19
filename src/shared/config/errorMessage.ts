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

  /**
   * 회의 관련
   */
  // POST /api/meetings
  TRANSCRIPT_REQUIRED: '회의 내용을 입력해주세요.',
  SUMMARY_REQUIRED: '회의 요약을 입력해주세요.',
  KEY_POINTS_REQUIRED: '주요 사항을 1개 이상 입력해주세요.',
  KEY_POINTS_TOO_MANY: '주요 사항은 최대 20개까지 저장할 수 있습니다.',
  INVALID_MEETING_REQUEST: '회의 저장 요청이 올바르지 않습니다. 다시 확인해주세요.',
  MEETING_SAVE_FAILED: '회의 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',

  // GET /api/meetings/dates
  INVALID_YEAR: '조회할 연도 형식이 올바르지 않습니다.',
  INVALID_MONTH: '조회할 월 형식이 올바르지 않습니다.',
  UNSUPPORTED_YEAR_MONTH: '조회할 수 없는 연월입니다.',
  MEETING_DATES_READ_FAILED: '회의 날짜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',

  // GET /api/meetings
  INVALID_DATE: '날짜 형식이 올바르지 않습니다.',
  UNSUPPORTED_DATE: '조회할 수 없는 날짜입니다.',
  INVALID_MEETINGS_QUERY: '회의 목록 조회 요청이 올바르지 않습니다.',
  MEETINGS_READ_FAILED: '회의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
} as const;
