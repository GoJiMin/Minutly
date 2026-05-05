# Minutly API 명세서

## 1. 문서 목적

이 문서는 Minutly 기능 명세서를 바탕으로 클라이언트와 Next.js 서버가 주고받는 API 계약을 정의한다.

API는 RESTful한 형태를 기본으로 하며, 인증이 필요한 API는 서버에서 토큰 유효성을 검증한 뒤 처리한다.

---

## 2. 공통 전제

- API는 Next.js Route Handler로 구현한다.
- 모든 보호된 API 요청은 인증 토큰 검증을 통과해야 한다.
- 인증 토큰은 `httpOnly` 쿠키로 관리한다.
- 서버는 Azure Speech 리소스 키와 AI API 키를 환경 변수로만 관리한다.
- 클라이언트에는 Azure 리소스 키와 AI API 키를 노출하지 않는다.
- 회의 데이터는 Neon Postgres의 `meetings` 레코드로 저장한다.
- 회의 `id`는 UUID 형식의 전역 고유 식별자다.
- `meetingDate`는 캘린더 및 날짜별 조회에 사용하는 서비스 기준 날짜다.
- `meetingDate`는 `createdAt`을 `Asia/Seoul` 시간대로 해석해 생성한다.
- `createdAt`은 회의 생성 시각 전체를 나타내는 ISO 문자열로 저장한다.
- `updatedAt`은 회의 마지막 수정 또는 재요약 저장 시각을 나타내는 ISO 문자열로 저장한다.
- DB 컬럼은 `snake_case`를 사용하지만 API 요청/응답은 `camelCase`를 사용한다.

---

## 3. 공통 응답 형식

### 3-1. 성공 응답

성공 응답은 클라이언트가 바로 사용할 수 있는 JSON 객체를 반환한다.

예시:

```json
{
  "summary": "회의 전체 요약",
  "keyPoints": ["주요 사항 1", "주요 사항 2"]
}
```

반환할 본문이 없는 성공 응답은 `204 No Content`를 사용한다.

### 3-2. 에러 응답

에러 응답은 `title`, `detail`, `status` 필드를 가진 JSON 객체를 반환한다.

```json
{
  "title": "TOKEN_EXPIRED",
  "detail": "인증 정보가 만료되었습니다.",
  "status": 401
}
```

### 3-3. 에러 응답 타입

```ts
type ErrorResponse = {
  title: string;
  detail: string;
  status: number;
};
```

### 3-4. 에러 응답 필드 설명

| Field    | Type   | 설명                                                                    |
| -------- | ------ | ----------------------------------------------------------------------- |
| `title`  | string | 에러를 식별하기 위한 코드. 예: `INTERNAL_SERVER_ERROR`, `TOKEN_EXPIRED` |
| `detail` | string | 에러 코드를 간결하게 설명하는 메시지                                      |
| `status` | number | 원래 의도한 HTTP 상태 코드. body에도 함께 포함한다.                     |

### 3-5. 주요 HTTP 상태 코드

| Status | 의미                     |
| ------ | ------------------------ |
| 200    | 요청 성공                |
| 201    | 리소스 생성 성공         |
| 204    | 응답 본문 없는 성공      |
| 400    | 잘못된 요청              |
| 401    | 인증 필요 또는 토큰 만료 |
| 403    | 권한 없음                |
| 404    | 리소스 없음              |
| 500    | 서버 내부 오류           |

### 3-6. 인증 에러 코드

인증 관련 401 응답은 클라이언트 제어에 필요한 최소한의 코드만 구분한다.

| Status | Title           | 사용 조건                                                                 | Detail                      |
| ------ | --------------- | ------------------------------------------------------------------------- | --------------------------- |
| 401    | `UNAUTHORIZED`  | 인증 정보가 없거나 유효하지 않은 경우, 또는 refresh token 검증에 실패한 경우 | 인증이 필요합니다.          |
| 401    | `TOKEN_EXPIRED` | 보호된 API에서 access token이 없거나 만료되었고 refresh token 쿠키가 있는 경우 | 인증 정보가 만료되었습니다. |

- `TOKEN_EXPIRED`는 사용자가 볼 상세 사유가 아니라 클라이언트가 `/api/auth/refresh`를 호출할지 판단하는 제어 신호다.
- 클라이언트는 모든 401 응답에 refresh를 시도하지 않고, `TOKEN_EXPIRED`에 대해서만 refresh를 1회 시도한다.
- refresh token 자체가 없거나 만료되었거나 유효하지 않은 경우 refresh API는 `UNAUTHORIZED`를 반환한다.

---

## 4. API 목록

| Method | Endpoint                                 | 설명                                     | 인증               |
| ------ | ---------------------------------------- | ---------------------------------------- | ------------------ |
| POST   | `/api/auth/login`                        | 로그인 정보 검증 후 토큰 쿠키 발급       | 불필요             |
| POST   | `/api/auth/refresh`                      | refresh token으로 access token 재발급    | refresh token 필요 |
| POST   | `/api/auth/logout`                       | 인증 쿠키 제거                           | 필요               |
| GET    | `/api/auth/me`                           | 현재 인증 상태 확인                      | 필요               |
| POST   | `/api/speech/token`                      | Azure Speech access token 발급           | 필요               |
| POST   | `/api/summaries`                         | transcript 기반 요약 생성                | 필요               |
| POST   | `/api/meetings`                          | 신규 회의 저장                           | 필요               |
| GET    | `/api/meetings/dates?year=YYYY&month=MM` | 특정 연월에서 회의가 있는 날짜 목록 조회 | 필요               |
| GET    | `/api/meetings?date=YYYY-MM-DD`          | 특정 날짜의 회의 목록 조회               | 필요               |
| GET    | `/api/meetings/{id}`                     | 특정 회의 상세 조회                      | 필요               |
| PUT    | `/api/meetings/{id}`                     | 기존 회의 수정 저장                      | 필요               |
| DELETE | `/api/meetings/{id}`                     | 기존 회의 삭제                           | 필요               |

---

## 5. 인증 API

## 5-1. 로그인

```http
POST /api/auth/login
```

### 목적

사용자가 입력한 `id`와 `password`를 검증하고, 검증 성공 시 `httpOnly` 속성의 access token과 refresh token 쿠키를 발급한다.

### Request Body

```json
{
  "id": "사용자 입력 ID",
  "password": "사용자 입력 비밀번호"
}
```

### Type

```ts
type LoginRequest = {
  id: string;
  password: string;
};
```

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 요청으로 받은 `id`와 `password`를 서버 환경 변수의 `AUTH_LOGIN_ID`, `AUTH_PASSWORD`와 비교한다.
- `id`와 `password`가 모두 일치하면 access token과 refresh token을 발급한다.
- 두 토큰은 `httpOnly` 쿠키로 설정한다.
- access token의 유효 기간은 1시간으로 설정한다.
- refresh token의 유효 기간은 4주로 설정한다.
- `id` 또는 `password`가 일치하지 않으면 401을 반환한다.
- 로그인 요청 body가 올바르지 않으면 400을 반환한다.
- `id`, `password`, 토큰 값은 응답 body에 포함하지 않는다.
- 인증 실패 응답은 `id`와 `password` 중 어느 값이 잘못되었는지 구분하지 않는다.

### Error

| Status | Title                 | Detail                              |
| ------ | --------------------- | ----------------------------------- |
| 400    | `INVALID_REQUEST`     | 요청 형식이 올바르지 않습니다.      |
| 401    | `INVALID_CREDENTIALS` | 로그인 정보가 올바르지 않습니다.    |
| 500    | `AUTH_LOGIN_FAILED`   | 로그인 처리 중 문제가 발생했습니다. |

---

## 5-2. 토큰 갱신

```http
POST /api/auth/refresh
```

### 목적

access token이 만료된 경우 refresh token을 검증해 새로운 access token 쿠키를 재발급한다.

### Request

- 별도 body 없음
- refresh token은 `httpOnly` 쿠키에서 읽는다.

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 refresh token 쿠키를 검증한다.
- refresh token이 유효하면 새로운 access token 쿠키를 발급한다.
- 재발급된 access token의 유효 기간은 1시간으로 설정한다.
- refresh token이 없거나 유효하지 않으면 401을 반환한다.
- refresh token 값은 응답 body에 포함하지 않는다.

### Error

| Status | Title                   | Detail                            |
| ------ | ----------------------- | --------------------------------- |
| 401    | `UNAUTHORIZED`          | 인증이 필요합니다.                |
| 500    | `AUTH_REFRESH_FAILED`   | 토큰 갱신 중 문제가 발생했습니다. |

---

## 5-3. 로그아웃

```http
POST /api/auth/logout
```

### 목적

access token과 refresh token 쿠키를 제거한다.

### Request

- 별도 body 없음

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 access token 쿠키와 refresh token 쿠키를 만료 처리한다.
- 로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 이동해야 한다.
- 초기 버전에서는 1인 사용을 전제로 하므로 로그아웃 기능을 별도 UI로 노출하지 않는다.
- 단, 인증 쿠키를 제거해야 하는 상황을 대비해 로그아웃 API 자체는 유지한다.

---

## 5-4. 인증 상태 확인

```http
GET /api/auth/me
```

### 목적

현재 요청이 인증된 사용자인지 확인한다.

### Type

```ts
type AuthMeResponse = {
  authenticated: boolean;
};
```

### Response

```json
{
  "authenticated": true
}
```

### 처리 규칙

- access token이 없거나 유효하지 않으면 401을 반환한다.
- 인증이 유효하면 `{ authenticated: true }`를 반환한다.

### Error

| Status | Title          | Detail             |
| ------ | -------------- | ------------------ |
| 401    | `UNAUTHORIZED` | 인증이 필요합니다. |
| 401    | `TOKEN_EXPIRED` | 인증 정보가 만료되었습니다. |

---

## 6. Azure Speech Token API

## 6-1. Azure Speech 토큰 발급

```http
POST /api/speech/token
```

### 목적

클라이언트가 Azure Speech SDK를 사용할 수 있도록 서버가 Azure Speech access token을 발급받아 반환한다.

### Request

- 별도 body 없음

### Type

```ts
type SpeechTokenResponse = {
  token: string;
  endpoint: string;
};
```

### Response

```json
{
  "token": "azure-speech-access-token",
  "endpoint": "https://koreacentral.api.cognitive.microsoft.com/"
}
```

### Response Headers

```http
Cache-Control: no-store
```

### 처리 규칙

- 서버는 Azure Speech 리소스 키를 환경 변수로만 관리한다.
- 서버는 Azure Speech 리소스 키를 사용해 Azure access token을 발급받는다.
- 클라이언트에는 Azure 리소스 키를 절대 내려주지 않는다.
- 클라이언트는 반환된 `token`과 `endpoint`를 사용해 Azure Speech SDK 연결을 수행한다.
- 토큰 응답은 캐싱되지 않도록 `Cache-Control: no-store` 헤더를 설정한다.

### Error

| Status | Title                 | Detail                              |
| ------ | --------------------- | ----------------------------------- |
| 401    | `UNAUTHORIZED`        | 인증이 필요합니다.                  |
| 401    | `TOKEN_EXPIRED`       | 인증 정보가 만료되었습니다.         |
| 500    | `SPEECH_TOKEN_FAILED` | 음성 인식 토큰 발급에 실패했습니다. |

---

## 7. 요약 API

## 7-1. 요약 생성

```http
POST /api/summaries
```

### 목적

사용자가 검토한 transcript를 기반으로 AI 요약을 생성한다.

### Request Body

```json
{
  "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
  "originTranscript": "Azure STT 원본 전사 텍스트",
  "transcript": "사용자가 수정한 최종 전사 텍스트"
}
```

### Type

```ts
type CreateSummaryRequest = {
  title: string;
  originTranscript: string;
  transcript: string;
};

type CreateSummaryResponse = {
  summary: string;
  keyPoints: string[];
};
```

### Response

```json
{
  "summary": "회의 전체 내용을 정리한 요약문",
  "keyPoints": ["주요 사항 1", "주요 사항 2"]
}
```

### 처리 규칙

- 서버는 AI API 키를 환경 변수로만 관리한다.
- 클라이언트는 AI API 키를 알 수 없어야 한다.
- 요약 결과는 `summary`, `keyPoints` 두 섹션으로 고정한다.
- 요약 생성 API와 회의 저장 API는 분리한다.
- 사용자는 원문 수정 후 요약만 별도로 다시 요청할 수 있어야 한다.
- 요약 실패 시 서버는 회의 데이터를 저장하지 않는다.
- 클라이언트는 요약 성공 후 회의 저장 API를 호출한다.

### Error

| Status | Title                | Detail                                |
| ------ | -------------------- | ------------------------------------- |
| 400    | `INVALID_TRANSCRIPT` | 요약할 회의 내용이 충분하지 않습니다. |
| 400    | `INVALID_TITLE`      | 회의 제목을 입력해주세요.             |
| 401    | `UNAUTHORIZED`       | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`      | 인증 정보가 만료되었습니다.           |
| 500    | `SUMMARY_FAILED`     | 요약 생성에 실패했습니다.             |

---

## 8. 회의 API

## 8-1. 회의 저장

```http
POST /api/meetings
```

### 목적

신규 회의 데이터를 Neon Postgres의 `meetings` 레코드로 저장한다.

### Request Body

```json
{
  "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
  "originTranscript": "Azure STT 원본 전사 텍스트",
  "transcript": "사용자가 수정한 최종 전사 텍스트",
  "summary": "회의 전체 내용을 정리한 요약문",
  "keyPoints": ["주요 사항 1", "주요 사항 2"]
}
```

### Type

```ts
type CreateMeetingRequest = {
  title: string;
  originTranscript: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
};

type CreateMeetingResponse = {
  id: string;
  meetingDate: string;
  createdAt: string;
  updatedAt: string;
};
```

### Response

```json
{
  "id": "9d8c0b40-66b4-4e19-a8a2-69d7b4d4b3c2",
  "meetingDate": "2026-04-26",
  "createdAt": "2026-04-26T14:00:00+09:00",
  "updatedAt": "2026-04-26T14:00:00+09:00"
}
```

### 처리 규칙

- 서버는 요청 시점의 현재 시간을 기준으로 `createdAt`을 생성한다.
- `updatedAt`은 최초 저장 시 `createdAt`과 같은 값으로 설정한다.
- `meetingDate`는 `createdAt`을 `Asia/Seoul` 시간대로 해석해 생성한다.
- `id`는 DB에서 생성하는 UUID를 사용한다.
- 저장 API는 조회 API가 아니므로 요청 본문에 포함된 전체 회의 데이터를 응답으로 다시 반환하지 않는다.
- 응답에는 저장 성공 후 클라이언트가 후속 처리를 수행하는 데 필요한 생성 메타데이터만 포함한다.
- 저장 성공 후 클라이언트는 관련 draft를 제거할 수 있다.

### Error

| Status | Title                 | Detail                                |
| ------ | --------------------- | ------------------------------------- |
| 400    | `INVALID_MEETING`     | 회의 저장 데이터가 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`        | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`       | 인증 정보가 만료되었습니다.           |
| 500    | `MEETING_SAVE_FAILED` | 회의 저장에 실패했습니다.             |

---

## 8-2. 회의 수정 저장

```http
PUT /api/meetings/{id}
```

### 목적

기존 회의의 transcript 수정 및 재요약 결과를 같은 회의 레코드에 갱신 저장한다.

### Path Parameter

| Name | Type   | 설명             |
| ---- | ------ | ---------------- |
| `id` | string | 회의 UUID 식별자 |

### Request Body

```json
{
  "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
  "originTranscript": "Azure STT 원본 전사 텍스트",
  "transcript": "수정된 최종 전사 텍스트",
  "summary": "재생성된 회의 요약문",
  "keyPoints": ["재생성된 주요 사항 1", "재생성된 주요 사항 2"]
}
```

### Type

```ts
type UpdateMeetingParams = {
  id: string;
};

type UpdateMeetingRequest = {
  title: string;
  originTranscript: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
};

type UpdateMeetingResponse = {
  id: string;
  meetingDate: string;
  updatedAt: string;
};
```

### Response

```json
{
  "id": "9d8c0b40-66b4-4e19-a8a2-69d7b4d4b3c2",
  "meetingDate": "2026-04-26",
  "updatedAt": "2026-04-26T14:18:32+09:00"
}
```

### 처리 규칙

- 서버는 path의 `id`로 기존 회의 레코드를 찾는다.
- 기존 회의가 존재하지 않으면 404를 반환한다.
- 수정 저장 시 `createdAt`은 기존 값을 유지한다.
- 수정 저장 시 `meetingDate`는 기존 값을 유지한다.
- 수정 저장 시 `updatedAt`은 서버 현재 시간으로 갱신한다.
- 수정 저장 API는 조회 API가 아니므로 요청 본문에 포함된 전체 회의 데이터를 응답으로 다시 반환하지 않는다.
- 응답에는 저장 성공 후 클라이언트가 후속 처리를 수행하는 데 필요한 수정 메타데이터만 포함한다.

### Error

| Status | Title                   | Detail                                |
| ------ | ----------------------- | ------------------------------------- |
| 400    | `INVALID_MEETING_ID`    | 회의 식별자 형식이 올바르지 않습니다. |
| 400    | `INVALID_MEETING`       | 회의 수정 데이터가 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`          | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`         | 인증 정보가 만료되었습니다.           |
| 404    | `MEETING_NOT_FOUND`     | 회의 기록을 찾을 수 없습니다.         |
| 500    | `MEETING_UPDATE_FAILED` | 회의 수정 저장에 실패했습니다.        |

---

## 8-3. 회의 삭제

```http
DELETE /api/meetings/{id}
```

### 목적

기존 회의 레코드를 삭제한다.

### Path Parameter

| Name | Type   | 설명             |
| ---- | ------ | ---------------- |
| `id` | string | 회의 UUID 식별자 |

### Type

```ts
type DeleteMeetingParams = {
  id: string;
};
```

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 path의 `id`로 기존 회의 레코드를 찾는다.
- 기존 회의가 존재하지 않으면 404를 반환한다.
- 삭제 확인 모달은 클라이언트에서 처리한다.
- 서버는 삭제 요청을 받으면 인증 후 해당 회의 레코드를 삭제한다.

### Error

| Status | Title                   | Detail                                |
| ------ | ----------------------- | ------------------------------------- |
| 400    | `INVALID_MEETING_ID`    | 회의 식별자 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`          | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`         | 인증 정보가 만료되었습니다.           |
| 404    | `MEETING_NOT_FOUND`     | 회의 기록을 찾을 수 없습니다.         |
| 500    | `MEETING_DELETE_FAILED` | 회의 삭제에 실패했습니다.             |

---

## 9. 히스토리 조회 API

## 9-1. 특정 연월의 회의 날짜 목록 조회

```http
GET /api/meetings/dates?year=YYYY&month=MM
```

### 목적

히스토리 캘린더에서 사용자가 현재 보고 있는 연월을 기준으로 회의가 존재하는 날짜 목록을 조회한다.

전체 날짜 목록을 한 번에 내려주지 않고, 캘린더에 표시 중인 월 단위로만 조회해 데이터 전송량을 제한한다.

### Query Parameter

| Name    | Type   | Required | 설명                     |
| ------- | ------ | -------- | ------------------------ |
| `year`  | string | true     | 조회할 연도. `YYYY` 형식 |
| `month` | string | true     | 조회할 월. `MM` 형식     |

### Request Example

```http
GET /api/meetings/dates?year=2026&month=04
```

### Type

```ts
type GetMeetingDatesQuery = {
  year: string;
  month: string;
};

type GetMeetingDatesResponse = {
  year: string;
  month: string;
  dates: string[];
};
```

### Response

```json
{
  "year": "2026",
  "month": "04",
  "dates": ["2026-04-26", "2026-04-27"]
}
```

### 처리 규칙

- 서버는 요청받은 `year`, `month`를 검증한다.
- 서버는 해당 월의 시작일과 다음 달 시작일을 계산한다.
- DB는 `meeting_date >= monthStart and meeting_date < nextMonthStart` 조건으로 조회한다.
- 날짜는 `YYYY-MM-DD` 형식으로 반환한다.
- 해당 연월에 회의가 하나도 없으면 빈 배열을 반환한다.
- 클라이언트는 현재 보고 있는 월을 기준으로 요청한다.
- 클라이언트는 필요 시 이전 달과 다음 달 데이터를 prefetch할 수 있다.
- 서버는 전체 기간의 회의 날짜 목록을 한 번에 반환하지 않는다.

### Error

| Status | Title                       | Detail                                |
| ------ | --------------------------- | ------------------------------------- |
| 400    | `INVALID_YEAR_MONTH`        | 조회할 연월 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`              | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`             | 인증 정보가 만료되었습니다.           |
| 500    | `MEETING_DATES_READ_FAILED` | 회의 날짜 목록을 불러오지 못했습니다. |

---

## 9-2. 특정 날짜의 회의 목록 조회

```http
GET /api/meetings?date=YYYY-MM-DD
```

### 목적

히스토리 화면에서 사용자가 선택한 날짜의 회의 목록을 조회한다.

### Query Parameter

| Name   | Type   | Required | 설명                           |
| ------ | ------ | -------- | ------------------------------ |
| `date` | string | true     | 조회할 날짜. `YYYY-MM-DD` 형식 |

### Type

```ts
type GetMeetingsByDateQuery = {
  date: string;
};

type MeetingListItem = {
  id: string;
  meetingDate: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type GetMeetingsByDateResponse = {
  meetings: MeetingListItem[];
};
```

### Response

```json
{
  "meetings": [
    {
      "id": "9d8c0b40-66b4-4e19-a8a2-69d7b4d4b3c2",
      "meetingDate": "2026-04-26",
      "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
      "createdAt": "2026-04-26T14:00:00+09:00",
      "updatedAt": "2026-04-26T14:18:32+09:00"
    }
  ]
}
```

### 처리 규칙

- 서버는 `date`를 검증한다.
- DB는 `meeting_date = date` 조건으로 조회한다.
- 해당 날짜에 회의가 없으면 빈 배열을 반환한다.
- 목록은 `updatedAt` 내림차순으로 정렬한다.
- 목록 응답에는 상세 본문인 `originTranscript`, `transcript`, `summary`, `keyPoints`를 포함하지 않는다.
- 목록 응답에는 summary preview도 포함하지 않는다.
- 목록 항목에는 상세 조회/수정/삭제 요청에 필요한 `id`를 포함한다.

### Error

| Status | Title                  | Detail                           |
| ------ | ---------------------- | -------------------------------- |
| 400    | `INVALID_DATE`         | 날짜 형식이 올바르지 않습니다.   |
| 401    | `UNAUTHORIZED`         | 인증이 필요합니다.               |
| 401    | `TOKEN_EXPIRED`        | 인증 정보가 만료되었습니다.      |
| 500    | `MEETINGS_READ_FAILED` | 회의 목록을 불러오지 못했습니다. |

---

## 9-3. 회의 상세 조회

```http
GET /api/meetings/{id}
```

### 목적

사용자가 선택한 회의의 상세 데이터를 조회한다.

### Path Parameter

| Name | Type   | 설명             |
| ---- | ------ | ---------------- |
| `id` | string | 회의 UUID 식별자 |

### Type

```ts
type GetMeetingDetailParams = {
  id: string;
};

type MeetingDetail = {
  id: string;
  title: string;
  meetingDate: string;
  createdAt: string;
  updatedAt: string;
  originTranscript: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
};

type GetMeetingDetailResponse = MeetingDetail;
```

### Response

```json
{
  "id": "9d8c0b40-66b4-4e19-a8a2-69d7b4d4b3c2",
  "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
  "meetingDate": "2026-04-26",
  "createdAt": "2026-04-26T14:00:00+09:00",
  "updatedAt": "2026-04-26T14:18:32+09:00",
  "originTranscript": "Azure STT 원본 전사 텍스트",
  "transcript": "사용자가 수정한 최종 전사 텍스트",
  "summary": "회의 전체 내용을 정리한 요약문",
  "keyPoints": ["주요 사항 1", "주요 사항 2"]
}
```

### 처리 규칙

- 서버는 path의 `id`로 회의 레코드를 조회한다.
- 회의가 존재하지 않으면 404를 반환한다.

### Error

| Status | Title                 | Detail                                |
| ------ | --------------------- | ------------------------------------- |
| 400    | `INVALID_MEETING_ID`  | 회의 식별자 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`        | 인증이 필요합니다.                    |
| 401    | `TOKEN_EXPIRED`       | 인증 정보가 만료되었습니다.           |
| 404    | `MEETING_NOT_FOUND`   | 회의 기록을 찾을 수 없습니다.         |
| 500    | `MEETING_READ_FAILED` | 회의 상세를 불러오지 못했습니다.      |

---

## 10. 클라이언트 요청 규칙

### 10-1. 회의 식별자 규칙

회의 `id`는 UUID 형식의 전역 고유 식별자다.

예시:

```txt
9d8c0b40-66b4-4e19-a8a2-69d7b4d4b3c2
```

회의 상세 조회/수정/삭제 요청에서는 `id`만 사용한다.

```ts
await fetch(`/api/meetings/${meeting.id}`);
```

날짜는 히스토리 목록 조회를 위한 필터로만 사용한다.

```ts
await fetch(`/api/meetings?date=${meeting.meetingDate}`);
```

### 10-2. 보호된 API 요청

- 보호된 API 요청은 access token 쿠키를 기준으로 인증된다.
- 보호된 API에서 `TOKEN_EXPIRED`가 반환되면 클라이언트는 `/api/auth/refresh`를 1회 호출해 access token 갱신을 시도한다.
- 보호된 API에서 `UNAUTHORIZED`가 반환되면 클라이언트는 refresh를 시도하지 않고 로그인 페이지로 이동한다.
- refresh API에서 `UNAUTHORIZED`가 반환되면 클라이언트는 로그인 페이지로 이동한다.
- 보호된 API에서 인증 정보가 없거나 유효하지 않은 경우 Route Handler 내부의 인증 검증에서 요청을 거부한다.

보호된 API 대상:

```http
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/speech/token
POST   /api/summaries
POST   /api/meetings
GET    /api/meetings/dates?year=YYYY&month=MM
GET    /api/meetings?date=YYYY-MM-DD
GET    /api/meetings/{id}
PUT    /api/meetings/{id}
DELETE /api/meetings/{id}
```

---

## 11. 설계 결정 사항

- 요약 생성 API와 회의 저장 API는 분리한다.
- access token의 유효 기간은 1시간으로 설정한다.
- refresh token의 유효 기간은 4주로 설정한다.
- `TOKEN_EXPIRED`는 refresh token 쿠키가 있어 갱신 시도가 가능한 경우에만 반환한다.
- refresh token 검증 실패는 `UNAUTHORIZED`로 처리한다.
- 로그아웃 API는 유지하되, 초기 버전에서는 별도 UI로 노출하지 않는다.
- 회의 저장소는 Neon Postgres를 사용한다.
- 회의 1건은 `meetings` 레코드 1개로 저장한다.
- 회의 상세 조회, 수정, 삭제는 UUID `id` 단독 식별을 사용한다.
- `date` query parameter는 히스토리 날짜 필터로만 사용한다.
- `meetingDate`는 캘린더 및 날짜별 조회 기준으로 사용한다.
- 회의 목록 응답에는 summary preview를 포함하지 않는다.
- MVP 보안은 인증 검증, `httpOnly` 쿠키, Vercel 기본 보호 기능을 우선 사용한다.
- 앱 레벨 감사 테이블과 rate limit은 MVP 이후 확장 후보로 둔다.
