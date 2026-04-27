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
- 회의 데이터는 서버 파일 시스템에 JSON 파일로 저장한다.
- 회의 파일은 `storage/meetings/{YYYY-MM-DD}/{HH-mm-ss}.json` 구조로 저장한다.
- 회의 `id`는 저장 파일명에서 확장자를 제외한 `HH-mm-ss` 값을 사용한다.
- `id`는 날짜 안에서만 고유하므로, 상세 조회/수정/삭제 요청은 `date`와 `id`를 함께 사용한다.
- `createdAt`은 회의 생성 시각 전체를 나타내는 ISO 문자열로 저장한다.
- 인증 실패와 의심스러운 요청은 서버 내부에서 보안 이벤트로 기록할 수 있다.
- 보안 이벤트는 외부에 공개되는 API가 아니며, API 처리 중 발생하는 서버 내부 side effect로 기록한다.
- 보안 이벤트는 fail2ban 같은 서버 보안 도구가 감시할 수 있는 로그 파일에 기록한다.
- 보안 로그 파일 경로는 서버 환경 변수로 관리한다.
- 보안 이벤트 기록 실패는 원래 API 응답을 막지 않아야 한다.
- 보안 로그에는 비밀번호, access token, refresh token, transcript, summary, keyPoints, 요청 body 전체를 포함하지 않는다.

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
  "detail": "인증 정보가 만료됐어요. 다시 로그인해주세요.",
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

| Field    | Type   | 설명                                                                                             |
| -------- | ------ | ------------------------------------------------------------------------------------------------ |
| `title`  | string | 에러를 식별하기 위한 코드. 예: `INTERNAL_SERVER_ERROR`, `TOKEN_EXPIRED`                          |
| `detail` | string | 에러 코드를 사람이 이해할 수 있는 문장으로 풀어쓴 상세 메시지                                    |
| `status` | number | 원래 의도한 HTTP 상태 코드. 응답 과정에서 상태 코드가 변질될 수 있으므로 body에도 함께 포함한다. |

### 3-5. 보안 이벤트와 응답

보안 이벤트가 기록되더라도 API 응답 형식은 기존 공통 응답 형식을 따른다.

- 성공 응답은 `data`로 감싸지 않는다.
- 에러 응답은 `{ title, detail, status }` 구조를 사용한다.
- 보안 이벤트 기록 여부는 클라이언트 응답 body에 포함하지 않는다.
- 보안 이벤트 기록 실패는 원래 API 응답을 막지 않는다.

### 3-6. 보안 이벤트 타입

보안 이벤트 타입은 클라이언트 응답 타입이 아니라 서버 내부 로그 타입이다.

```ts
type SecurityEvent =
  | "INVALID_PASSWORD"
  | "INVALID_LOGIN_REQUEST"
  | "INVALID_REFRESH_TOKEN"
  | "UNAUTHORIZED_API_ACCESS"
  | "TOO_MANY_LOGIN_ATTEMPTS"
  | "SUSPICIOUS_REQUEST";
```

### 3-7. 보안 로그 타입

보안 로그는 fail2ban이 감시할 수 있도록 한 줄 단위로 기록한다.

```ts
type SecurityLogEntry = {
  ts: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  event: SecurityEvent;
  userAgent: string;
};
```

보안 로그에는 비밀번호, access token, refresh token, transcript, summary, keyPoints, 요청 body 전체를 포함하지 않는다.

### 3-8. 주요 HTTP 상태 코드

| Status | 의미                     |
| ------ | ------------------------ |
| 200    | 요청 성공                |
| 201    | 리소스 생성 성공         |
| 204    | 응답 본문 없는 성공      |
| 400    | 잘못된 요청              |
| 401    | 인증 필요 또는 토큰 만료 |
| 403    | 권한 없음                |
| 404    | 리소스 없음              |
| 409    | 리소스 충돌              |
| 429    | 너무 많은 요청           |
| 500    | 서버 내부 오류           |

---

## 4. API 목록

| Method | Endpoint                                 | 설명                                     | 인증               |
| ------ | ---------------------------------------- | ---------------------------------------- | ------------------ |
| POST   | `/api/auth/login`                        | 비밀번호 검증 후 토큰 쿠키 발급          | 불필요             |
| POST   | `/api/auth/refresh`                      | refresh token으로 access token 재발급    | refresh token 필요 |
| POST   | `/api/auth/logout`                       | 인증 쿠키 제거                           | 필요               |
| GET    | `/api/auth/me`                           | 현재 인증 상태 확인                      | 필요               |
| POST   | `/api/speech/token`                      | Azure Speech access token 발급           | 필요               |
| POST   | `/api/summaries`                         | transcript 기반 요약 생성                | 필요               |
| GET    | `/api/meetings/dates?year=YYYY&month=MM` | 특정 연월에서 회의가 있는 날짜 목록 조회 | 필요               |
| GET    | `/api/meetings?date=YYYY-MM-DD`          | 특정 날짜의 회의 목록 조회               | 필요               |
| GET    | `/api/meetings/{date}/{id}`              | 특정 회의 상세 조회                      | 필요               |
| POST   | `/api/meetings`                          | 신규 회의 저장                           | 필요               |
| PUT    | `/api/meetings/{date}/{id}`              | 기존 회의 수정 저장                      | 필요               |
| DELETE | `/api/meetings/{date}/{id}`              | 기존 회의 삭제                           | 필요               |

보안 이벤트 로깅은 별도 public API로 제공하지 않는다.

---

## 5. 인증 API

## 5-1. 로그인

```http
POST /api/auth/login
```

### 목적

사용자가 입력한 비밀번호를 검증하고, 검증 성공 시 `httpOnly` 속성의 access token과 refresh token 쿠키를 발급한다.

### Request Body

```json
{
  "password": "사용자 입력 비밀번호"
}
```

### Type

```ts
type LoginRequest = {
  password: string;
};
```

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 요청으로 받은 비밀번호를 환경 변수에 저장된 비밀번호와 비교한다.
- 비밀번호가 일치하면 access token과 refresh token을 발급한다.
- 두 토큰은 `httpOnly` 쿠키로 설정한다.
- access token의 유효 기간은 1시간으로 설정한다.
- refresh token의 유효 기간은 4주로 설정한다.
- 비밀번호가 일치하지 않으면 401을 반환한다.
- 로그인 요청 body가 올바르지 않으면 `INVALID_LOGIN_REQUEST` 보안 이벤트를 기록한다.
- 비밀번호가 일치하지 않으면 `INVALID_PASSWORD` 보안 이벤트를 기록한다.
- 짧은 시간 안에 로그인 실패가 반복되는 경우 `TOO_MANY_LOGIN_ATTEMPTS` 보안 이벤트를 기록할 수 있다.
- 보안 이벤트 로그에는 사용자가 입력한 비밀번호를 기록하지 않는다.
- 보안 이벤트 기록 실패는 로그인 API의 원래 응답을 막지 않는다.

### Error

| Status | Title                     | Detail                                                |
| ------ | ------------------------- | ----------------------------------------------------- |
| 400    | `INVALID_REQUEST`         | 비밀번호를 입력해주세요.                              |
| 401    | `INVALID_PASSWORD`        | 비밀번호가 올바르지 않습니다.                         |
| 429    | `TOO_MANY_LOGIN_ATTEMPTS` | 로그인 시도가 너무 많아요. 잠시 후 다시 시도해주세요. |
| 500    | `AUTH_LOGIN_FAILED`       | 로그인 처리 중 문제가 발생했습니다.                   |

### Security Event Mapping

| 상황                              | Status | Error Title               | Security Event               |
| --------------------------------- | -----: | ------------------------- | ---------------------------- |
| 비밀번호 누락 또는 body 형식 오류 |    400 | `INVALID_REQUEST`         | `INVALID_LOGIN_REQUEST`      |
| 비밀번호 불일치                   |    401 | `INVALID_PASSWORD`        | `INVALID_PASSWORD`           |
| 로그인 실패 반복                  |    429 | `TOO_MANY_LOGIN_ATTEMPTS` | `TOO_MANY_LOGIN_ATTEMPTS`    |
| 서버 내부 오류                    |    500 | `AUTH_LOGIN_FAILED`       | 필요 시 `SUSPICIOUS_REQUEST` |

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
- refresh token이 없거나 유효하지 않으면 `INVALID_REFRESH_TOKEN` 보안 이벤트를 기록한다.
- refresh token 검증 실패가 반복되는 경우 fail2ban 차단 판단 대상이 될 수 있다.
- 보안 이벤트 로그에는 refresh token 값을 기록하지 않는다.
- 보안 이벤트 기록 실패는 토큰 갱신 API의 원래 응답을 막지 않는다.

### Error

| Status | Title                   | Detail                            |
| ------ | ----------------------- | --------------------------------- |
| 401    | `INVALID_REFRESH_TOKEN` | 다시 로그인해주세요.              |
| 500    | `AUTH_REFRESH_FAILED`   | 토큰 갱신 중 문제가 발생했습니다. |

### Security Event Mapping

| 상황                        | Status | Error Title             | Security Event               |
| --------------------------- | -----: | ----------------------- | ---------------------------- |
| refresh token 없음          |    401 | `INVALID_REFRESH_TOKEN` | `INVALID_REFRESH_TOKEN`      |
| refresh token 유효하지 않음 |    401 | `INVALID_REFRESH_TOKEN` | `INVALID_REFRESH_TOKEN`      |
| 서버 내부 오류              |    500 | `AUTH_REFRESH_FAILED`   | 필요 시 `SUSPICIOUS_REQUEST` |

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
- 단순한 access token 만료는 정상 사용자에게도 발생할 수 있으므로 fail2ban 차단 판단에 사용하지 않는다.
- 필요 시 인증 없는 반복 접근은 `UNAUTHORIZED_API_ACCESS` 보안 이벤트로 기록할 수 있다.
- 보안 이벤트 기록 실패는 인증 상태 확인 API의 원래 응답을 막지 않는다.

### Error

| Status | Title          | Detail             |
| ------ | -------------- | ------------------ |
| 401    | `UNAUTHORIZED` | 인증이 필요합니다. |

### Security Event Mapping

| 상황              | Status | Error Title                         | Security Event                    |
| ----------------- | -----: | ----------------------------------- | --------------------------------- |
| 인증 정보 없음    |    401 | `UNAUTHORIZED`                      | 필요 시 `UNAUTHORIZED_API_ACCESS` |
| access token 만료 |    401 | `UNAUTHORIZED` 또는 `TOKEN_EXPIRED` | 차단 판단 제외                    |

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
| 500    | `SUMMARY_FAILED`     | 요약 생성에 실패했습니다.             |

---

## 8. 회의 API

## 8-1. 회의 저장

```http
POST /api/meetings
```

### 목적

신규 회의 데이터를 서버 파일 시스템에 JSON 파일로 저장한다.

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
  date: string;
  createdAt: string;
  updatedAt: string;
};
```

### Response

```json
{
  "id": "14-00-00",
  "date": "2026-04-26",
  "createdAt": "2026-04-26T14:00:00+09:00",
  "updatedAt": "2026-04-26T14:00:00+09:00"
}
```

### 처리 규칙

- 서버는 요청 시점의 현재 시간을 기준으로 `createdAt`을 생성한다.
- `date`는 `createdAt`의 날짜 값인 `YYYY-MM-DD`를 사용한다.
- `id`는 `createdAt`의 시간 값을 `HH-mm-ss` 형식으로 변환해 사용한다.
- 최초 저장 시 `updatedAt`은 `createdAt`과 같은 값으로 설정한다.
- 저장 경로는 `storage/meetings/{date}/{id}.json`을 따른다.
- 저장 API는 조회 API가 아니므로 요청 본문에 포함된 전체 회의 데이터를 응답으로 다시 반환하지 않는다.
- 응답에는 저장 성공 후 클라이언트가 후속 처리를 수행하는 데 필요한 생성 메타데이터만 포함한다.
- 저장 성공 후 클라이언트는 관련 draft를 제거할 수 있다.

### Error

| Status | Title                    | Detail                                          |
| ------ | ------------------------ | ----------------------------------------------- |
| 400    | `INVALID_MEETING`        | 회의 저장 데이터가 올바르지 않습니다.           |
| 401    | `UNAUTHORIZED`           | 인증이 필요합니다.                              |
| 409    | `MEETING_ALREADY_EXISTS` | 같은 날짜와 시각의 회의 기록이 이미 존재합니다. |
| 500    | `MEETING_SAVE_FAILED`    | 회의 저장에 실패했습니다.                       |

---

## 8-2. 회의 수정 저장

```http
PUT /api/meetings/{date}/{id}
```

### 목적

기존 회의의 transcript 수정 및 재요약 결과를 같은 JSON 파일에 덮어써 저장한다.

### Path Parameter

| Name   | Type   | 설명                                  |
| ------ | ------ | ------------------------------------- |
| `date` | string | 회의가 저장된 날짜. `YYYY-MM-DD` 형식 |
| `id`   | string | 회의 식별자. `HH-mm-ss` 형식          |

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
  date: string;
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
  date: string;
  updatedAt: string;
};
```

### Response

```json
{
  "id": "14-00-00",
  "date": "2026-04-26",
  "updatedAt": "2026-04-26T14:18:32+09:00"
}
```

### 처리 규칙

- 서버는 path의 `date`와 `id`를 조합해 기존 JSON 파일을 찾는다.
- 파일 경로는 `storage/meetings/{date}/{id}.json`을 따른다.
- 기존 회의가 존재하지 않으면 404를 반환한다.
- 수정 저장 시 `createdAt`은 기존 값을 유지한다.
- 수정 저장 시 `updatedAt`은 서버 현재 시간으로 갱신한다.
- 기존 JSON 파일을 overwrite한다.
- 수정 저장 API는 조회 API가 아니므로 요청 본문에 포함된 전체 회의 데이터를 응답으로 다시 반환하지 않는다.
- 응답에는 저장 성공 후 클라이언트가 후속 처리를 수행하는 데 필요한 수정 메타데이터만 포함한다.

### Error

| Status | Title                   | Detail                                          |
| ------ | ----------------------- | ----------------------------------------------- |
| 400    | `INVALID_MEETING`       | 회의 수정 데이터가 올바르지 않습니다.           |
| 400    | `INVALID_DATE_OR_ID`    | 회의 날짜 또는 식별자 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`          | 인증이 필요합니다.                              |
| 404    | `MEETING_NOT_FOUND`     | 회의 기록을 찾을 수 없습니다.                   |
| 500    | `MEETING_UPDATE_FAILED` | 회의 수정 저장에 실패했습니다.                  |

---

## 8-3. 회의 삭제

```http
DELETE /api/meetings/{date}/{id}
```

### 목적

기존 회의 JSON 파일을 삭제한다.

### Path Parameter

| Name   | Type   | 설명                                  |
| ------ | ------ | ------------------------------------- |
| `date` | string | 회의가 저장된 날짜. `YYYY-MM-DD` 형식 |
| `id`   | string | 회의 식별자. `HH-mm-ss` 형식          |

### Type

```ts
type DeleteMeetingParams = {
  date: string;
  id: string;
};
```

### Response

```http
204 No Content
```

### 처리 규칙

- 서버는 path의 `date`와 `id`를 조합해 기존 JSON 파일을 찾는다.
- 파일 경로는 `storage/meetings/{date}/{id}.json`을 따른다.
- 기존 회의가 존재하지 않으면 404를 반환한다.
- 삭제 확인 모달은 클라이언트에서 처리한다.
- 서버는 삭제 요청을 받으면 인증 후 해당 파일을 삭제한다.

### Error

| Status | Title                   | Detail                                          |
| ------ | ----------------------- | ----------------------------------------------- |
| 400    | `INVALID_DATE_OR_ID`    | 회의 날짜 또는 식별자 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`          | 인증이 필요합니다.                              |
| 404    | `MEETING_NOT_FOUND`     | 회의 기록을 찾을 수 없습니다.                   |
| 500    | `MEETING_DELETE_FAILED` | 회의 삭제에 실패했습니다.                       |

---

## 9. 히스토리 조회 API

## 9-1. 특정 연월의 회의 날짜 목록 조회

```http
GET /api/meetings/dates?year=YYYY&month=MM
```

### 목적

히스토리 캘린더에서 사용자가 현재 보고 있는 연월을 기준으로 회의가 존재하는 날짜 목록을 조회한다.

전체 날짜 목록을 한 번에 내려주지 않고, 캘린더에 표시 중인 월 단위로만 조회해 데이터 전송량과 파일 탐색 범위를 제한한다.

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

- 서버는 요청받은 `year`, `month`에 해당하는 날짜 폴더만 조회한다.
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
  date: string;
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
      "id": "14-00-00",
      "date": "2026-04-26",
      "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
      "createdAt": "2026-04-26T14:00:00+09:00",
      "updatedAt": "2026-04-26T14:18:32+09:00"
    }
  ]
}
```

### 처리 규칙

- 서버는 `storage/meetings/{date}` 폴더를 읽는다.
- 해당 날짜 폴더가 없으면 빈 배열을 반환한다.
- 목록은 `updatedAt` 내림차순으로 정렬한다.
- 목록 응답에는 상세 본문인 `originTranscript`, `transcript`, `summary`, `keyPoints`를 포함하지 않는다.
- 목록 응답에는 summary preview도 포함하지 않는다.
- 회의 식별은 제목을 기준으로 수행한다.
- 목록 항목에는 상세 조회/수정/삭제 요청에 필요한 `date`와 `id`를 포함한다.

### Error

| Status | Title                  | Detail                           |
| ------ | ---------------------- | -------------------------------- |
| 400    | `INVALID_DATE`         | 날짜 형식이 올바르지 않습니다.   |
| 401    | `UNAUTHORIZED`         | 인증이 필요합니다.               |
| 500    | `MEETINGS_READ_FAILED` | 회의 목록을 불러오지 못했습니다. |

---

## 9-3. 회의 상세 조회

```http
GET /api/meetings/{date}/{id}
```

### 목적

사용자가 선택한 회의의 상세 데이터를 조회한다.

### Path Parameter

| Name   | Type   | 설명                                  |
| ------ | ------ | ------------------------------------- |
| `date` | string | 회의가 저장된 날짜. `YYYY-MM-DD` 형식 |
| `id`   | string | 회의 식별자. `HH-mm-ss` 형식          |

### Type

```ts
type GetMeetingDetailParams = {
  date: string;
  id: string;
};

type MeetingDetail = {
  id: string;
  title: string;
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
  "id": "14-00-00",
  "title": "[2026-04-26. 일] - 메디큐브 시딩 제품 관련 오션 회의",
  "createdAt": "2026-04-26T14:00:00+09:00",
  "updatedAt": "2026-04-26T14:18:32+09:00",
  "originTranscript": "Azure STT 원본 전사 텍스트",
  "transcript": "사용자가 수정한 최종 전사 텍스트",
  "summary": "회의 전체 내용을 정리한 요약문",
  "keyPoints": ["주요 사항 1", "주요 사항 2"]
}
```

### 처리 규칙

- 서버는 path의 `date`와 `id`를 조합해 파일 경로를 찾는다.
- 파일 경로는 `storage/meetings/{date}/{id}.json`을 따른다.
- 회의가 존재하지 않으면 404를 반환한다.

### Error

| Status | Title                 | Detail                                          |
| ------ | --------------------- | ----------------------------------------------- |
| 400    | `INVALID_DATE_OR_ID`  | 회의 날짜 또는 식별자 형식이 올바르지 않습니다. |
| 401    | `UNAUTHORIZED`        | 인증이 필요합니다.                              |
| 404    | `MEETING_NOT_FOUND`   | 회의 기록을 찾을 수 없습니다.                   |
| 500    | `MEETING_READ_FAILED` | 회의 상세를 불러오지 못했습니다.                |

---

## 10. 클라이언트 요청 규칙

### 10-1. 회의 식별자 규칙

회의 `id`는 저장 파일명에서 확장자를 제외한 `HH-mm-ss` 값을 사용한다.

예시:

```txt
14-00-00
```

회의 상세 조회/수정/삭제 요청에서는 `date`와 `id`를 함께 사용한다.

```ts
await fetch(`/api/meetings/${meeting.date}/${meeting.id}`);
```

서버는 `date`와 `id`를 조합해 파일 경로를 찾는다.

```ts
const filePath = `storage/meetings/${date}/${id}.json`;
```

`id`는 URL-safe한 `HH-mm-ss` 형식이므로 별도 `encodeURIComponent(id)` 처리는 필요하지 않다.

### 10-2. 보호된 API 요청

- 보호된 API 요청은 access token 쿠키를 기준으로 인증된다.
- access token이 만료된 경우 클라이언트는 `/api/auth/refresh`를 호출해 토큰 갱신을 시도할 수 있다.
- refresh token도 유효하지 않으면 로그인 페이지로 이동한다.
- 보호된 API에서 인증 정보가 없거나 유효하지 않은 경우 Route Handler 내부의 인증 검증에서 요청을 거부한다.
- 보호된 API에 대한 반복적인 비정상 접근은 필요 시 `UNAUTHORIZED_API_ACCESS` 보안 이벤트로 기록할 수 있다.
- access token 만료는 정상 사용자에게도 발생할 수 있으므로 fail2ban 차단 판단에는 사용하지 않는다.
- 보안 이벤트 기록 실패는 보호 API의 원래 에러 응답 반환을 막지 않는다.

보호된 API 대상:

```http
POST   /api/speech/token
POST   /api/summaries
GET    /api/meetings/dates?year=YYYY&month=MM
GET    /api/meetings?date=YYYY-MM-DD
GET    /api/meetings/{date}/{id}
POST   /api/meetings
PUT    /api/meetings/{date}/{id}
DELETE /api/meetings/{date}/{id}
```

---

## 11. 설계 결정 사항

- 요약 생성 API와 회의 저장 API는 분리한다.
- access token의 유효 기간은 1시간으로 설정한다.
- refresh token의 유효 기간은 4주로 설정한다.
- 로그아웃 API는 유지하되, 초기 버전에서는 별도 UI로 노출하지 않는다.
- 회의 목록 응답에는 summary preview를 포함하지 않는다.
- 보안 이벤트 로깅은 별도 외부 API로 제공하지 않는다.
- 인증 실패와 의심스러운 요청은 서버 내부 side effect로 보안 로그에 기록한다.
- 보안 로그는 fail2ban 같은 서버 차단 도구와 연동할 수 있어야 한다.
- 보안 이벤트 기록 실패는 원래 API 응답을 막지 않는다.
- `INVALID_PASSWORD`, `INVALID_LOGIN_REQUEST`, `INVALID_REFRESH_TOKEN`, `TOO_MANY_L
