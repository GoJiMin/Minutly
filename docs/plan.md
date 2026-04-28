# Minutly 개발 계획서

## 1. 문서 목적

이 문서는 Minutly의 PRD, 기능 명세서, API 명세서를 바탕으로 실제 개발 순서를 정의한다.

목표는 다음과 같다.

- 구현 범위를 단계별로 분리한다.
- 각 단계의 완료 기준을 명확히 한다.
- AI 개발 도구가 참고하기 쉬운 작업 단위로 쪼갠다.
- 기능이 산으로 가지 않도록 MVP 범위를 유지한다.
- 각 작업 항목은 체크 가능한 단위로 관리한다.

---

## 2. 개발 전제

### 2-1. 기술 스택

#### 코어

- Next.js
- TypeScript

#### 상태관리

- React Query (서버 상태)
- Context API (클라이언트 상태)
  - Zustand는 필요성이 명확해진 경우에만 도입

#### STT

- Azure Speech F0 Free Tier

#### 테스트

- Jest
- React Testing Library

#### 배포 및 CI/CD

- GitHub Actions
- Oracle Cloud

### 2-2. 핵심 저장 규칙

- 최종 회의 데이터는 서버 파일 시스템에 저장한다.
- 저장 경로는 다음 구조를 따른다.

```txt
storage/meetings/{YYYY-MM-DD}/{HH-mm-ss}.json
```

- 회의 `id`는 파일명에서 확장자를 제외한 `HH-mm-ss` 값을 사용한다.
- `id`는 날짜 안에서만 고유하므로 상세 조회, 수정, 삭제 시 `date + id`를 함께 사용한다.

### 2-3. 핵심 API 규칙

- 에러 응답은 `{ title, detail, status }` 구조를 사용한다.
- 반환 본문이 없는 성공 응답은 `204 No Content`를 사용한다.
- 보호된 API 요청은 Route Handler 내부에서 토큰 유효성을 검증한다.

### 2-4. 보안 운영 원칙

- 비밀번호 실패, 잘못된 로그인 요청, refresh token 검증 실패 등은 보안 이벤트로 기록한다.
- 보안 로그에는 비밀번호, access token, refresh token, transcript, summary, keyPoints, 요청 body 전체를 기록하지 않는다.
- 보안 이벤트 로그 파일 경로는 환경 변수로 관리한다.
- fail2ban은 보안 이벤트 로그를 감시하고 반복되는 비정상 요청을 IP 단위로 차단할 수 있어야 한다.
- ban 시간은 반복 횟수에 따라 점진적으로 증가할 수 있다.
- 토큰 만료처럼 정상 사용자에게도 발생할 수 있는 이벤트는 차단 판단에 사용하지 않는다.

### 2-5. 테스트 및 배포 원칙

- 각 Phase의 주요 기능 구현 직후 해당 기능을 검증하는 테스트를 함께 작성한다.
- 테스트 도구는 Jest와 React Testing Library를 사용한다.
- CI에서는 테스트와 커버리지 검사를 실행한다.
- 커버리지 threshold 이하로 떨어지면 CI가 실패해야 한다.
- 배포는 GitHub Actions를 통해 Oracle 서버까지 자동 배포되는 파이프라인을 우선 구성한다.
- 배포 workflow는 테스트/커버리지 검증을 통과한 경우에만 실행되어야 한다.

---

## 3. 전체 개발 단계 요약

| Phase    | 이름                               | 목표                                                                              |
| -------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| Phase 0  | 프로젝트 초기 세팅                 | Next.js, TypeScript, FSD, 테스트, CI/CD, 배포, 보안 로그/fail2ban 골격 구성       |
| Phase 1  | 공통 기반 구현                     | 공통 타입, API 클라이언트, 에러 응답, 검증 유틸, 보안 로그 유틸 구축              |
| Phase 2  | 인증 구현                          | 비밀번호 로그인, 토큰 발급/갱신, Proxy 보호, API 인증 검증, 보안 이벤트 기록 구현 |
| Phase 3  | 파일 저장소 구현                   | 회의 JSON 저장/조회/수정/삭제를 위한 파일 시스템 유틸 구현                        |
| Phase 4  | 핵심 API 구현                      | Speech token, summary, meetings API 구현                                          |
| Phase 5  | 녹음 및 STT 구현                   | Azure Speech SDK 연결, 최근 10개 문장 미리보기, draft autosave 구현               |
| Phase 6  | 전사 검토 및 요약 저장 플로우 구현 | transcript review, title 입력, 요약 생성, 회의 저장 구현                          |
| Phase 7  | 히스토리 UI 구현                   | 캘린더, 날짜별 목록, 상세 조회 구현                                               |
| Phase 8  | 저장된 회의 수정/삭제 구현         | transcript 편집, 재요약, overwrite 저장, 삭제 모달 구현                           |
| Phase 9  | 에러 복구 및 안정화                | draft 복구, summary snapshot 복구, 에러 바운더리, 테스트 보강                     |
| Phase 10 | 최종 검증 및 배포 안정화           | 테스트/CI/CD/보안 차단/배포 흐름 최종 검증                                        |

---

## 4. Phase 0. 프로젝트 초기 세팅

### 4-1. 목표

Next.js와 TypeScript 기반으로 Minutly 프로젝트의 기본 구조를 생성한다.

기능 구현 전에 테스트 인프라, CI/CD, Oracle 서버 자동 배포 파이프라인, 보안 이벤트 로그 및 fail2ban 연동을 먼저 구현해 이후 모든 기능이 테스트·배포·보안 검증 위에서 개발될 수 있도록 한다.

### 4-2. 작업 체크리스트

#### Project Setup

- [x] Next.js 최신 버전 프로젝트를 생성한다.
- [x] TypeScript 설정을 적용한다.
- [x] ESLint 설정을 적용한다.
- [ ] Prettier 설정을 적용한다.
- [ ] 절대 경로 alias를 설정한다.
- [ ] FSD 기본 디렉터리 구조를 생성한다.
- [ ] React Query Provider를 애플리케이션에 연결한다.
- [ ] 기본 레이아웃을 생성한다.
- [ ] 전역 스타일을 설정한다.
- [ ] `/login` 라우트를 생성한다.
- [ ] `/` 라우트를 생성한다.
- [ ] `/history` 라우트를 생성한다.
- [ ] `.env.example` 파일을 작성한다.

#### Test / CI Setup

- [ ] Jest 설정을 적용한다.
- [ ] React Testing Library 설정을 적용한다.
- [ ] jest setup 파일을 작성한다.
- [ ] 테스트 실행 스크립트를 작성한다.
- [ ] CI 테스트 실행 스크립트를 작성한다.
- [ ] 커버리지 수집 설정을 적용한다.
- [ ] 커버리지 threshold를 설정한다.
- [ ] GitHub Actions 테스트 workflow를 작성한다.
- [ ] 테스트 실패 시 CI가 실패하도록 설정한다.
- [ ] 커버리지 threshold 미달 시 CI가 실패하도록 설정한다.

#### Deploy Setup

- [ ] GitHub Actions 배포 workflow를 작성한다.
- [ ] Oracle 서버 접속에 필요한 GitHub Secrets 항목을 정의한다.
- [ ] 테스트 workflow 성공 후에만 배포 workflow가 실행되도록 설정한다.
- [ ] Oracle 서버 배포 스크립트를 작성한다.
- [ ] 배포 후 애플리케이션 상태를 확인하는 health check 명령을 작성한다.

#### Security Operation Setup

- [ ] `MINUTLY_SECURITY_LOG_PATH` 환경 변수를 `.env.example`에 추가한다.
- [ ] 보안 로그 파일 기본 경로를 정의한다.
- [ ] Oracle 서버에서 보안 로그 디렉터리 생성 경로를 정의한다.
- [ ] 보안 로그 디렉터리 권한 설정 방식을 정리한다.
- [ ] fail2ban filter 파일 초안을 작성한다.
- [ ] fail2ban jail 파일 초안을 작성한다.
- [ ] fail2ban 점진 ban 정책 초안을 작성한다.
- [ ] 보안 로그 logrotate 설정 초안을 작성한다.
- [ ] Nginx가 `X-Real-IP`와 `X-Forwarded-For`를 전달하도록 설정 초안을 작성한다.
- [ ] 앱 포트가 외부에 직접 노출되지 않도록 운영 전제를 문서화한다.

### 4-3. 예상 디렉터리

```txt
app/ => Next.js 기본 App Router
src/ => FSD 아키텍처 구성 디렉터리
  app/
  views/
  widgets/ => 상황에 따라 제거 가능
  features/
  entities/
  shared/
```

### 4-4. 완료 기준 체크리스트

- [ ] 개발 서버가 정상 실행된다.
- [ ] 기본 라우트(`/`, `/login`, `/history`)가 생성되어 있다.
- [ ] FSD 디렉터리 구조가 준비되어 있다.
- [ ] React Query Provider가 애플리케이션에 연결되어 있다.
- [ ] Jest와 React Testing Library로 테스트를 실행할 수 있다.
- [ ] 커버리지 threshold 미달 시 CI가 실패한다.
- [ ] GitHub Actions에서 테스트 workflow가 실행된다.
- [ ] GitHub Actions에서 Oracle 서버 배포 workflow가 실행 가능한 상태다.
- [ ] 배포 workflow는 테스트 workflow를 통과한 경우에만 실행된다.
- [ ] 보안 로그 파일 경로가 환경 변수로 정의되어 있다.
- [ ] fail2ban filter/jail 초안이 준비되어 있다.
- [ ] logrotate 설정 초안이 준비되어 있다.

---

## 5. Phase 1. 공통 기반 구현

### 5-1. 목표

API, 에러, 검증, 날짜 포맷, 파일 경로, 보안 로그 등 이후 단계에서 반복 사용될 공통 기반을 만든다.

### 5-2. 작업 체크리스트

#### API / Error Foundation

- [ ] `ErrorResponse` 타입을 정의한다.
- [ ] API 에러 응답 파서를 구현한다.
- [ ] 공통 fetch wrapper를 구현한다.
- [ ] 공통 에러 응답 생성 유틸을 구현한다.
- [ ] zod 기반 request body 검증 유틸을 구현한다.
- [ ] zod 기반 query parameter 검증 유틸을 구현한다.
- [ ] zod 기반 route parameter 검증 유틸을 구현한다.

#### Date / Storage Foundation

- [ ] `YYYY-MM-DD` 날짜 포맷 유틸을 구현한다.
- [ ] `HH-mm-ss` 시간 포맷 유틸을 구현한다.
- [ ] `[YYYY-MM-DD. 요일]` 제목 prefix 유틸을 구현한다.
- [ ] `createdAt`에서 `date`를 생성하는 유틸을 구현한다.
- [ ] `createdAt`에서 `id`를 생성하는 유틸을 구현한다.
- [ ] `localStorage` read 유틸을 구현한다.
- [ ] `localStorage` write 유틸을 구현한다.
- [ ] `localStorage` remove 유틸을 구현한다.

#### Security Log Foundation

- [ ] 보안 이벤트 타입을 정의한다.
- [ ] 보안 로그 라인 포맷을 정의한다.
- [ ] 클라이언트 IP 추출 유틸을 구현한다.
- [ ] user-agent sanitize 유틸을 구현한다.
- [ ] 보안 로그 write 유틸을 구현한다.
- [ ] 보안 로그 기록 실패가 요청 처리를 막지 않도록 처리한다.
- [ ] 보안 로그에서 민감 데이터가 제외되도록 규칙을 적용한다.

### 5-3. 주요 타입

```ts
type ErrorResponse = {
  title: string;
  detail: string;
  status: number;
};

type SecurityEvent =
  | "INVALID_PASSWORD"
  | "INVALID_LOGIN_REQUEST"
  | "INVALID_REFRESH_TOKEN"
  | "UNAUTHORIZED_API_ACCESS"
  | "TOO_MANY_LOGIN_ATTEMPTS"
  | "SUSPICIOUS_REQUEST";
```

### 5-4. 테스트 체크리스트

- [ ] `ErrorResponse` 타입 사용 케이스를 테스트한다.
- [ ] API 에러 응답 파서를 테스트한다.
- [ ] 공통 에러 응답 생성 유틸을 테스트한다.
- [ ] request body 검증 유틸을 테스트한다.
- [ ] query parameter 검증 유틸을 테스트한다.
- [ ] route parameter 검증 유틸을 테스트한다.
- [ ] 날짜 포맷 유틸을 테스트한다.
- [ ] 시간 포맷 유틸을 테스트한다.
- [ ] 제목 prefix 유틸을 테스트한다.
- [ ] localStorage read/write/remove 유틸을 테스트한다.
- [ ] 클라이언트 IP 추출 유틸을 테스트한다.
- [ ] 보안 로그 라인 포맷을 테스트한다.
- [ ] 보안 로그에 민감 데이터가 포함되지 않는지 테스트한다.

### 5-5. 완료 기준 체크리스트

- [ ] 성공 응답과 에러 응답을 일관되게 처리할 수 있다.
- [ ] API 명세에 맞는 공통 에러 응답을 생성할 수 있다.
- [ ] 날짜와 시간 기반 meeting path 값을 생성할 수 있다.
- [ ] 공통 localStorage 유틸로 draft 데이터를 다룰 수 있다.
- [ ] 보안 이벤트를 한 줄 로그로 기록할 수 있다.
- [ ] 보안 이벤트 기록 실패가 정상 요청 처리를 막지 않는다.

---

## 6. Phase 2. 인증 구현

### 6-1. 목표

1인 사용을 전제로 한 단일 비밀번호 인증과 보호된 페이지/API 접근 제어를 구현한다.

인증 실패와 의심스러운 인증 요청은 보안 이벤트로 기록해 fail2ban 연동 기반을 제공한다.

### 6-2. 구현 API

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### 6-3. 작업 체크리스트

#### Auth Domain

- [ ] 로그인 요청 schema를 정의한다.
- [ ] access token payload 타입을 정의한다.
- [ ] refresh token payload 타입을 정의한다.
- [ ] 비밀번호 검증 유틸을 구현한다.
- [ ] access token 발급 유틸을 구현한다.
- [ ] refresh token 발급 유틸을 구현한다.
- [ ] access token 검증 유틸을 구현한다.
- [ ] refresh token 검증 유틸을 구현한다.
- [ ] 인증 쿠키 설정 유틸을 구현한다.
- [ ] 인증 쿠키 제거 유틸을 구현한다.
- [ ] Route Handler용 `requireAuth` 유틸을 구현한다.

#### Auth Security Events

- [ ] 비밀번호 검증 실패 시 `INVALID_PASSWORD` 이벤트를 기록한다.
- [ ] 로그인 요청 형식 오류 시 `INVALID_LOGIN_REQUEST` 이벤트를 기록한다.
- [ ] refresh token 누락 시 `INVALID_REFRESH_TOKEN` 이벤트를 기록한다.
- [ ] refresh token 검증 실패 시 `INVALID_REFRESH_TOKEN` 이벤트를 기록한다.
- [ ] 보호된 API에 인증 없이 접근한 경우 필요 시 `UNAUTHORIZED_API_ACCESS` 이벤트를 기록한다.
- [ ] access token 만료 이벤트는 차단 판단 대상에서 제외한다.
- [ ] 인증 관련 보안 로그에 비밀번호 값이 포함되지 않도록 처리한다.
- [ ] 인증 관련 보안 로그에 token 값이 포함되지 않도록 처리한다.

#### Auth API

- [ ] `POST /api/auth/login` Route Handler를 구현한다.
- [ ] `POST /api/auth/refresh` Route Handler를 구현한다.
- [ ] `POST /api/auth/logout` Route Handler를 구현한다.
- [ ] `GET /api/auth/me` Route Handler를 구현한다.
- [ ] 로그인 성공 시 access token 쿠키를 발급한다.
- [ ] 로그인 성공 시 refresh token 쿠키를 발급한다.
- [ ] access token 유효 기간 1시간을 적용한다.
- [ ] refresh token 유효 기간 4주를 적용한다.
- [ ] 인증 실패 시 명세된 에러 응답을 반환한다.

#### Proxy / UI

- [ ] Next.js Proxy에서 보호 페이지 접근을 검사한다.
- [ ] 인증되지 않은 사용자를 `/login`으로 리다이렉트한다.
- [ ] 로그인 페이지 UI를 구현한다.
- [ ] 로그인 mutation을 구현한다.
- [ ] 로그인 성공 시 메인 화면으로 이동한다.
- [ ] 인증 상태 확인 query를 구현한다.

### 6-4. 보호 대상

- `/`
- `/history`
- 보호된 `/api/*` Route Handler

### 6-5. 테스트 체크리스트

- [ ] 비밀번호 검증 성공 케이스를 테스트한다.
- [ ] 비밀번호 검증 실패 케이스를 테스트한다.
- [ ] access token 발급을 테스트한다.
- [ ] refresh token 발급을 테스트한다.
- [ ] access token 검증 성공/실패 케이스를 테스트한다.
- [ ] refresh token 검증 성공/실패 케이스를 테스트한다.
- [ ] 로그인 API 성공 케이스를 테스트한다.
- [ ] 로그인 API 실패 케이스를 테스트한다.
- [ ] 토큰 갱신 API 성공 케이스를 테스트한다.
- [ ] 토큰 갱신 API 실패 케이스를 테스트한다.
- [ ] 인증되지 않은 사용자의 보호 페이지 접근 차단을 테스트한다.
- [ ] 보호된 API에서 `requireAuth`가 동작하는지 테스트한다.
- [ ] 비밀번호 실패 시 `INVALID_PASSWORD` 로그가 기록되는지 테스트한다.
- [ ] 잘못된 로그인 요청 시 `INVALID_LOGIN_REQUEST` 로그가 기록되는지 테스트한다.
- [ ] refresh token 실패 시 `INVALID_REFRESH_TOKEN` 로그가 기록되는지 테스트한다.
- [ ] 인증 보안 로그에 비밀번호와 token 값이 포함되지 않는지 테스트한다.

### 6-6. 완료 기준 체크리스트

- [ ] 올바른 비밀번호 입력 시 인증 쿠키가 발급된다.
- [ ] 잘못된 비밀번호 입력 시 401 에러가 반환된다.
- [ ] 인증되지 않은 사용자는 보호된 페이지에 접근할 수 없다.
- [ ] 보호된 API는 토큰 검증을 통과해야만 실행된다.
- [ ] access token 만료 시 refresh token으로 재발급할 수 있다.
- [ ] 인증 실패와 의심스러운 인증 요청이 보안 이벤트로 기록된다.
- [ ] 보안 이벤트 기록 실패가 로그인/토큰 갱신 응답을 막지 않는다.

---

## 7. Phase 3. 파일 저장소 구현

### 7-1. 목표

DB 없이 서버 파일 시스템을 사용해 회의 데이터를 JSON 파일로 저장하고 조회할 수 있게 만든다.

### 7-2. 저장 구조

```txt
storage/meetings/{date}/{id}.json
```

예시:

```txt
storage/meetings/2026-04-26/14-00-00.json
```

### 7-3. 작업 체크리스트

#### Meeting Model

- [ ] `Meeting` 타입을 정의한다.
- [ ] `MeetingListItem` 타입을 정의한다.
- [ ] `CreateMeetingRequest` 타입을 정의한다.
- [ ] `UpdateMeetingRequest` 타입을 정의한다.
- [ ] `Meeting` 저장 schema를 정의한다.
- [ ] `CreateMeetingRequest` schema를 정의한다.
- [ ] `UpdateMeetingRequest` schema를 정의한다.
- [ ] `date` route parameter schema를 정의한다.
- [ ] `id` route parameter schema를 정의한다.

#### Path Utilities

- [ ] storage root 경로를 정의한다.
- [ ] meetings root 경로를 정의한다.
- [ ] `getMeetingDirectoryPath(date)`를 구현한다.
- [ ] `getMeetingFilePath(date, id)`를 구현한다.
- [ ] `createMeetingPathFromCreatedAt(createdAt)`을 구현한다.
- [ ] 날짜 폴더 생성 유틸을 구현한다.

#### File Utilities

- [ ] `readMeeting(date, id)`를 구현한다.
- [ ] `writeMeeting(date, id, meeting)`을 구현한다.
- [ ] `deleteMeeting(date, id)`를 구현한다.
- [ ] `listMeetingDates(year, month)`를 구현한다.
- [ ] `listMeetingsByDate(date)`를 구현한다.
- [ ] 날짜 폴더가 없을 때 빈 배열을 반환하도록 처리한다.
- [ ] 회의 파일이 없을 때 not found 에러를 반환하도록 처리한다.
- [ ] JSON parse 실패 시 storage 에러를 반환하도록 처리한다.
- [ ] atomic write 적용 여부를 검토한다.

### 7-4. 주요 타입

```ts
type Meeting = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  originTranscript: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
};

type MeetingListItem = {
  id: string;
  date: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};
```

### 7-5. 테스트 체크리스트

- [ ] `getMeetingDirectoryPath(date)`를 테스트한다.
- [ ] `getMeetingFilePath(date, id)`를 테스트한다.
- [ ] `createMeetingPathFromCreatedAt(createdAt)`을 테스트한다.
- [ ] 신규 회의 저장 유틸을 테스트한다.
- [ ] 회의 상세 조회 유틸을 테스트한다.
- [ ] 회의 수정 저장 유틸을 테스트한다.
- [ ] 회의 삭제 유틸을 테스트한다.
- [ ] 월별 회의 날짜 조회 유틸을 테스트한다.
- [ ] 날짜별 회의 목록 조회 유틸을 테스트한다.
- [ ] 날짜 폴더가 없을 때 빈 배열을 반환하는지 테스트한다.
- [ ] 회의 파일이 없을 때 not found 에러를 반환하는지 테스트한다.
- [ ] JSON parse 실패 시 storage 에러를 반환하는지 테스트한다.

### 7-6. 완료 기준 체크리스트

- [ ] 신규 회의 JSON 파일을 저장할 수 있다.
- [ ] `date + id`로 회의 상세를 읽을 수 있다.
- [ ] 특정 날짜의 회의 목록을 조회할 수 있다.
- [ ] 특정 연월에서 회의가 존재하는 날짜 목록을 조회할 수 있다.
- [ ] 기존 회의를 overwrite 저장할 수 있다.
- [ ] 기존 회의를 삭제할 수 있다.

---

## 8. Phase 4. 핵심 API 구현

### 8-1. 목표

API 명세서에 정의된 Speech, Summary, Meetings API를 구현한다.

### 8-2. 구현 API

```http
POST   /api/speech/token
POST   /api/summaries
POST   /api/meetings
GET    /api/meetings/dates?year=YYYY&month=MM
GET    /api/meetings?date=YYYY-MM-DD
GET    /api/meetings/{date}/{id}
PUT    /api/meetings/{date}/{id}
DELETE /api/meetings/{date}/{id}
```

### 8-3. 작업 체크리스트

#### Speech Token API

- [ ] Speech token 응답 타입을 정의한다.
- [ ] Azure Speech token 발급 어댑터를 구현한다.
- [ ] `POST /api/speech/token` Route Handler를 구현한다.
- [ ] Speech token 응답에 `token`을 포함한다.
- [ ] Speech token 응답에 `endpoint`를 포함한다.
- [ ] Speech token 응답에 `Cache-Control: no-store` 헤더를 설정한다.
- [ ] Azure 리소스 키가 클라이언트에 노출되지 않도록 검증한다.

#### Summary API

- [ ] `CreateSummaryRequest` 검증을 적용한다.
- [ ] AI 요약 provider 호출 어댑터를 구현한다.
- [ ] AI 응답에서 `summary`를 추출한다.
- [ ] AI 응답에서 `keyPoints`를 추출한다.
- [ ] `POST /api/summaries` Route Handler를 구현한다.
- [ ] 요약 실패 시 `SUMMARY_FAILED` 에러를 반환한다.
- [ ] 요약 API에서 회의 저장을 수행하지 않도록 유지한다.

#### Meetings API

- [ ] `POST /api/meetings` Route Handler를 구현한다.
- [ ] `GET /api/meetings/dates` Route Handler를 구현한다.
- [ ] `GET /api/meetings?date=...` Route Handler를 구현한다.
- [ ] `GET /api/meetings/{date}/{id}` Route Handler를 구현한다.
- [ ] `PUT /api/meetings/{date}/{id}` Route Handler를 구현한다.
- [ ] `DELETE /api/meetings/{date}/{id}` Route Handler를 구현한다.
- [ ] 신규 저장 응답에 `id`를 반환한다.
- [ ] 신규 저장 응답에 `date`를 반환한다.
- [ ] 신규 저장 응답에 `createdAt`을 반환한다.
- [ ] 신규 저장 응답에 `updatedAt`을 반환한다.
- [ ] 수정 저장 응답에 `id`를 반환한다.
- [ ] 수정 저장 응답에 `date`를 반환한다.
- [ ] 수정 저장 응답에 `updatedAt`을 반환한다.
- [ ] 삭제 성공 시 `204 No Content`를 반환한다.
- [ ] 모든 보호 API에서 `requireAuth`를 호출한다.

### 8-4. 테스트 체크리스트

- [ ] Speech token API 성공 케이스를 테스트한다.
- [ ] Speech token API 실패 케이스를 테스트한다.
- [ ] Speech token 응답에 `Cache-Control: no-store`가 포함되는지 테스트한다.
- [ ] Summary API 요청 검증 실패 케이스를 테스트한다.
- [ ] Summary API 성공 케이스를 테스트한다.
- [ ] Summary API 실패 케이스를 테스트한다.
- [ ] 신규 회의 저장 API 성공 케이스를 테스트한다.
- [ ] 신규 회의 저장 API 실패 케이스를 테스트한다.
- [ ] 월별 회의 날짜 조회 API를 테스트한다.
- [ ] 날짜별 회의 목록 조회 API를 테스트한다.
- [ ] 회의 상세 조회 API를 테스트한다.
- [ ] 회의 수정 저장 API를 테스트한다.
- [ ] 회의 삭제 API를 테스트한다.
- [ ] 보호된 API에서 인증 실패 시 401을 반환하는지 테스트한다.

### 8-5. 완료 기준 체크리스트

- [ ] API 명세의 모든 endpoint가 구현되어 있다.
- [ ] 각 API는 명세된 요청/응답 타입을 따른다.
- [ ] 성공 응답은 `data`로 감싸지 않는다.
- [ ] 에러 응답은 `{ title, detail, status }` 형식을 따른다.
- [ ] 반환 본문이 없는 성공 응답은 `204 No Content`를 반환한다.

---

## 9. Phase 5. 녹음 및 STT 구현

### 9-1. 목표

브라우저에서 마이크 권한을 요청하고, Azure Speech SDK를 통해 실시간 전사를 수행한다.

### 9-2. 작업 체크리스트

#### Speech Client

- [ ] Speech token API 클라이언트 함수를 구현한다.
- [ ] Azure Speech SDK 초기화 함수를 구현한다.
- [ ] Azure Speech recognizer 생성 함수를 구현한다.
- [ ] Azure Speech recognizer 정리 함수를 구현한다.

#### Recording Flow

- [ ] 마이크 권한 요청 흐름을 구현한다.
- [ ] 녹음 시작 액션을 구현한다.
- [ ] 녹음 종료 액션을 구현한다.
- [ ] 녹음 상태를 `recording`으로 전환하는 로직을 구현한다.
- [ ] 녹음 종료 시 `transcript_review`로 전환하는 로직을 구현한다.

#### Transcript Chunks

- [ ] Azure 최종 인식 완료 이벤트 핸들러를 구현한다.
- [ ] 인식된 문장을 전체 transcript chunk에 추가한다.
- [ ] 최근 10개 문장 preview chunk에 추가한다.
- [ ] preview chunk가 10개를 초과하면 가장 오래된 문장을 제거한다.
- [ ] 전체 transcript chunk를 review transcript로 변환하는 함수를 구현한다.

#### Recording Error

- [ ] STT 오류 발생 시 `error` 상태로 전환한다.
- [ ] STT 오류 발생 시 현재 transcript를 즉시 draft로 저장한다.
- [ ] 다시 녹음 시작 액션을 구현한다.
- [ ] 다시 녹음 시작 시 `[녹음 중단 구간]` chunk를 추가한다.

### 9-3. 상태

```ts
type RecordingStatus =
  | "idle"
  | "recording"
  | "transcript_review"
  | "summarizing"
  | "completed"
  | "error";
```

### 9-4. 테스트 체크리스트

- [ ] Speech token API 클라이언트 함수를 테스트한다.
- [ ] Azure 최종 인식 완료 이벤트 처리 로직을 테스트한다.
- [ ] 전체 transcript chunk 누적 로직을 테스트한다.
- [ ] 최근 10개 문장 preview 유지 로직을 테스트한다.
- [ ] preview chunk가 10개를 초과하면 오래된 문장이 제거되는지 테스트한다.
- [ ] 전체 transcript chunk를 review transcript로 변환하는 함수를 테스트한다.
- [ ] STT 오류 발생 시 draft 저장 로직을 테스트한다.
- [ ] 다시 녹음 시작 시 `[녹음 중단 구간]`이 추가되는지 테스트한다.
- [ ] 녹음 상태 전이를 테스트한다.

### 9-5. 완료 기준 체크리스트

- [ ] 사용자가 녹음을 시작하고 종료할 수 있다.
- [ ] Azure STT 최종 인식 문장을 transcript로 누적할 수 있다.
- [ ] 화면에는 최근 10개 문장만 표시된다.
- [ ] 녹음 중 오류가 발생하면 현재 데이터가 draft로 저장된다.
- [ ] 다시 녹음을 시작하면 `[녹음 중단 구간]`이 transcript에 남는다.

---

## 10. Phase 6. 전사 검토 및 요약 저장 플로우 구현

### 10-1. 목표

녹음 종료 후 사용자가 transcript와 제목을 검토하고, 요약 생성 후 회의 데이터를 저장할 수 있게 한다.

### 10-2. 작업 체크리스트

#### Transcript Review UI

- [ ] transcript review 화면을 구현한다.
- [ ] 전체 transcript 편집 영역을 구현한다.
- [ ] 제목 입력 영역을 구현한다.
- [ ] 날짜/요일 prefix 표시를 구현한다.
- [ ] `[녹음 중단 구간]` 마커가 transcript에 표시되도록 한다.

#### Summary Request

- [ ] 제목 미입력 시 요약 생성 버튼을 비활성화한다.
- [ ] transcript가 비어 있을 때 요약 생성 버튼을 비활성화한다.
- [ ] transcript가 너무 짧을 때 요약 생성 버튼을 비활성화한다.
- [ ] 요약 요청 직전 summary snapshot을 저장한다.
- [ ] `POST /api/summaries` mutation을 구현한다.
- [ ] 요약 요청 중 `summarizing` 상태로 전환한다.
- [ ] 요약 실패 시 title을 유지한다.
- [ ] 요약 실패 시 transcript를 유지한다.

#### Meeting Save

- [ ] 요약 성공 후 `POST /api/meetings` mutation을 호출한다.
- [ ] 회의 저장 성공 시 draft를 제거한다.
- [ ] 회의 저장 성공 시 summary snapshot을 제거한다.
- [ ] 회의 저장 실패 시 draft를 유지한다.
- [ ] 회의 저장 실패 시 summary snapshot을 유지한다.
- [ ] 저장 성공 후 결과 화면으로 전환한다.

#### Result UI

- [ ] 총 회의 요약 영역을 구현한다.
- [ ] 주요 사항 목록 영역을 구현한다.
- [ ] 원문 transcript 영역을 구현한다.

### 10-3. 테스트 체크리스트

- [ ] 제목 미입력 시 요약 생성 버튼이 비활성화되는지 테스트한다.
- [ ] transcript가 비어 있을 때 요약 생성 버튼이 비활성화되는지 테스트한다.
- [ ] transcript가 너무 짧을 때 요약 생성 버튼이 비활성화되는지 테스트한다.
- [ ] 요약 요청 직전 summary snapshot이 저장되는지 테스트한다.
- [ ] 요약 실패 시 title이 유지되는지 테스트한다.
- [ ] 요약 실패 시 transcript가 유지되는지 테스트한다.
- [ ] 요약 성공 후 회의 저장 mutation이 호출되는지 테스트한다.
- [ ] 회의 저장 성공 시 draft가 제거되는지 테스트한다.
- [ ] 회의 저장 실패 시 draft가 유지되는지 테스트한다.
- [ ] 결과 화면에 summary가 표시되는지 테스트한다.
- [ ] 결과 화면에 keyPoints가 표시되는지 테스트한다.

### 10-4. 완료 기준 체크리스트

- [ ] 녹음 종료 후 transcript review 화면으로 진입한다.
- [ ] 사용자가 transcript를 수정할 수 있다.
- [ ] 사용자가 제목을 입력할 수 있다.
- [ ] 제목과 transcript가 준비된 경우에만 요약 생성이 가능하다.
- [ ] 요약 성공 후 회의가 JSON으로 저장된다.
- [ ] 저장 성공 후 결과 화면으로 전환된다.

---

## 11. Phase 7. 히스토리 UI 구현

### 11-1. 목표

캘린더 기반으로 저장된 회의 기록을 탐색하고 상세를 확인할 수 있게 한다.

### 11-2. 작업 체크리스트

#### History Layout

- [ ] `/history` 페이지를 구현한다.
- [ ] 헤더의 `기록` 메뉴를 구현한다.
- [ ] 히스토리 좌측 1/3 영역을 구현한다.
- [ ] 히스토리 우측 2/3 영역을 구현한다.
- [ ] 저장된 회의가 없는 경우 빈 상태 UI를 구현한다.
- [ ] 빈 상태에서 메인 이동 버튼을 구현한다.

#### Calendar

- [ ] 캘린더 UI를 구현한다.
- [ ] 현재 보고 있는 연월 상태를 관리한다.
- [ ] 현재 월 기준 회의 날짜 목록 query를 구현한다.
- [ ] 회의가 있는 날짜 강조 표시를 구현한다.
- [ ] 월 이동 액션을 구현한다.
- [ ] 월 이동 시 해당 월 데이터 요청을 구현한다.
- [ ] 이전 월 데이터 prefetch를 구현한다.
- [ ] 다음 월 데이터 prefetch를 구현한다.

#### Meeting List

- [ ] 날짜 선택 상태를 관리한다.
- [ ] 날짜 선택 시 날짜별 회의 목록 query를 실행한다.
- [ ] 선택 날짜의 회의 목록 UI를 구현한다.
- [ ] 회의 목록을 `updatedAt` 내림차순으로 표시한다.
- [ ] 회의 목록 항목에 제목을 표시한다.
- [ ] 회의 목록 항목에 시간 정보를 표시한다.

#### Meeting Detail

- [ ] 선택 회의 상태를 관리한다.
- [ ] 회의 선택 시 상세 query를 실행한다.
- [ ] 우측 상세 영역에 제목을 표시한다.
- [ ] 우측 상세 영역에 생성 시각을 표시한다.
- [ ] 우측 상세 영역에 수정 시각을 표시한다.
- [ ] 우측 상세 영역에 summary를 표시한다.
- [ ] 우측 상세 영역에 keyPoints를 표시한다.
- [ ] 우측 상세 영역에 transcript를 표시한다.

### 11-3. 테스트 체크리스트

- [ ] 저장된 회의가 없을 때 빈 상태 UI가 표시되는지 테스트한다.
- [ ] 현재 월 기준 회의 날짜 목록 query가 호출되는지 테스트한다.
- [ ] 회의가 있는 날짜가 캘린더에 강조 표시되는지 테스트한다.
- [ ] 월 이동 시 해당 월 데이터가 요청되는지 테스트한다.
- [ ] 날짜 선택 시 날짜별 회의 목록 query가 호출되는지 테스트한다.
- [ ] 회의 목록이 `updatedAt` 내림차순으로 표시되는지 테스트한다.
- [ ] 회의 선택 시 상세 query가 호출되는지 테스트한다.
- [ ] 회의 상세 정보가 우측 영역에 표시되는지 테스트한다.

### 11-4. 완료 기준 체크리스트

- [ ] 사용자는 `/history`에 항상 진입할 수 있다.
- [ ] 저장된 회의가 없으면 빈 상태 UI가 표시된다.
- [ ] 캘린더에서 회의가 있는 날짜가 강조된다.
- [ ] 날짜 선택 시 해당 날짜의 회의 목록이 표시된다.
- [ ] 회의 선택 시 상세 내용이 표시된다.

---

## 12. Phase 8. 저장된 회의 수정 및 삭제 구현

### 12-1. 목표

히스토리 상세 화면에서 transcript를 수정해 재요약하거나, 불필요한 회의를 삭제할 수 있게 한다.

### 12-2. 작업 체크리스트

#### Action Buttons

- [ ] 상세 영역 상단 액션 버튼 그룹을 구현한다.
- [ ] 편집 버튼을 구현한다.
- [ ] 다시 요약 버튼을 구현한다.
- [ ] 삭제 버튼을 구현한다.

#### Edit Mode

- [ ] 편집 모드 진입 로직을 구현한다.
- [ ] transcript 편집 영역을 구현한다.
- [ ] 마지막 저장본 transcript를 보관한다.
- [ ] 현재 transcript와 마지막 저장본 transcript 비교 로직을 구현한다.
- [ ] 변경 사항이 없으면 다시 요약 버튼을 비활성화한다.
- [ ] 변경 사항이 있으면 다시 요약 버튼을 활성화한다.

#### Re-summary

- [ ] 저장된 회의 재요약 mutation을 구현한다.
- [ ] 재요약 요청 직전 summary snapshot을 저장한다.
- [ ] 재요약 성공 후 `PUT /api/meetings/{date}/{id}` mutation을 호출한다.
- [ ] 수정 저장 성공 시 `updatedAt`을 화면에 반영한다.
- [ ] 수정 저장 성공 시 meeting detail query를 invalidate한다.
- [ ] 수정 저장 성공 시 meetings by date query를 invalidate한다.

#### Delete

- [ ] 삭제 확인 모달을 구현한다.
- [ ] 삭제 확인 모달에 복구 불가 안내를 표시한다.
- [ ] 삭제 취소 액션을 구현한다.
- [ ] 삭제 확정 액션을 구현한다.
- [ ] `DELETE /api/meetings/{date}/{id}` mutation을 구현한다.
- [ ] 삭제 성공 시 meeting detail query를 제거한다.
- [ ] 삭제 성공 시 meetings by date query를 invalidate한다.
- [ ] 삭제 성공 시 meeting dates query를 invalidate한다.
- [ ] 삭제 성공 시 상세 선택 상태를 초기화한다.

### 12-3. 테스트 체크리스트

- [ ] 편집 버튼 클릭 시 편집 모드로 진입하는지 테스트한다.
- [ ] transcript 변경 사항이 없으면 다시 요약 버튼이 비활성화되는지 테스트한다.
- [ ] transcript 변경 사항이 있으면 다시 요약 버튼이 활성화되는지 테스트한다.
- [ ] 재요약 요청 직전 summary snapshot이 저장되는지 테스트한다.
- [ ] 재요약 성공 후 수정 저장 mutation이 호출되는지 테스트한다.
- [ ] 수정 저장 성공 시 관련 query가 invalidate되는지 테스트한다.
- [ ] 삭제 버튼 클릭 시 확인 모달이 표시되는지 테스트한다.
- [ ] 삭제 취소 시 삭제 mutation이 호출되지 않는지 테스트한다.
- [ ] 삭제 확정 시 삭제 mutation이 호출되는지 테스트한다.
- [ ] 삭제 성공 시 상세 선택 상태가 초기화되는지 테스트한다.

### 12-4. 완료 기준 체크리스트

- [ ] 사용자는 저장된 회의의 transcript를 편집할 수 있다.
- [ ] 변경 사항이 없으면 다시 요약 버튼은 비활성화된다.
- [ ] 변경 사항이 있으면 다시 요약 후 기존 JSON 파일을 갱신할 수 있다.
- [ ] 사용자는 삭제 확인 모달을 거쳐 회의를 삭제할 수 있다.
- [ ] 삭제 후 히스토리 목록과 상세 화면이 갱신된다.

---

## 13. Phase 9. 에러 복구 및 안정화

### 13-1. 목표

예상 가능한 실패와 예상하지 못한 전체 화면 에러에서 사용자 데이터가 최대한 유지되도록 한다.

### 13-2. 작업 체크리스트

#### Expected Errors

- [ ] 공통 에러 표시 UI를 구현한다.
- [ ] API 에러의 `detail` 메시지를 표시한다.
- [ ] 마이크 권한 거부 안내를 구현한다.
- [ ] STT 중단 안내를 구현한다.
- [ ] 요약 실패 시 title을 유지한다.
- [ ] 요약 실패 시 transcript를 유지한다.
- [ ] 저장 실패 시 draft를 유지한다.
- [ ] 삭제 실패 시 재시도 가능한 상태를 유지한다.

#### Error Boundary

- [ ] Next.js error boundary를 구현한다.
- [ ] 에러 화면에서 `다시 시도` 액션을 구현한다.
- [ ] 에러 화면에서 `메인으로 이동` 액션을 구현한다.
- [ ] summary snapshot 존재 여부를 확인한다.
- [ ] summary snapshot이 있으면 `임시 내용 복구` 액션을 표시한다.
- [ ] `임시 내용 복구` 액션을 구현한다.
- [ ] 임시 내용 복구 시 transcript review 상태로 이동한다.
- [ ] 임시 내용 복구 시 title을 복구한다.
- [ ] 임시 내용 복구 시 originTranscript를 복구한다.
- [ ] 임시 내용 복구 시 transcript를 복구한다.

### 13-3. 테스트 체크리스트

- [ ] API 에러의 `detail` 메시지가 사용자에게 표시되는지 테스트한다.
- [ ] 마이크 권한 거부 안내가 표시되는지 테스트한다.
- [ ] STT 중단 안내가 표시되는지 테스트한다.
- [ ] 저장 실패 시 draft가 유지되는지 테스트한다.
- [ ] 삭제 실패 시 재시도 가능한 상태가 유지되는지 테스트한다.
- [ ] summary snapshot이 없으면 임시 내용 복구 액션이 숨겨지는지 테스트한다.
- [ ] summary snapshot이 있으면 임시 내용 복구 액션이 표시되는지 테스트한다.
- [ ] 임시 내용 복구 시 title이 복구되는지 테스트한다.
- [ ] 임시 내용 복구 시 originTranscript가 복구되는지 테스트한다.
- [ ] 임시 내용 복구 시 transcript가 복구되는지 테스트한다.

### 13-4. 완료 기준 체크리스트

- [ ] 예상 가능한 API 실패는 기존 입력을 유지한 채 사용자에게 안내된다.
- [ ] 요약 중 전체 화면 에러가 발생해도 snapshot을 복구할 수 있다.
- [ ] 녹음 중 오류가 발생해도 마지막 임시 저장 데이터 기준으로 복구 가능하다.
- [ ] 에러 화면에서 사용자는 다음 행동을 선택할 수 있다.

---

## 14. Phase 10. 최종 검증 및 배포 안정화

### 14-1. 목표

각 Phase에서 작성된 테스트와 CI/CD 흐름을 바탕으로 실제 배포 가능한 상태를 최종 검증한다.

Phase 10은 테스트를 한 번에 작성하는 단계가 아니라, 이미 작성된 테스트와 배포 자동화가 실제 운영 흐름에서 동작하는지 확인하는 단계다.

### 14-2. 최종 검증 체크리스트

- [ ] 전체 테스트 스위트를 실행한다.
- [ ] 전체 테스트가 통과하는지 확인한다.
- [ ] 커버리지 threshold를 충족하는지 확인한다.
- [ ] CI에서 테스트가 자동으로 실행되는지 확인한다.
- [ ] CI에서 커버리지 threshold 미달 시 실패하는지 확인한다.
- [ ] 배포 workflow가 테스트 성공 이후에만 실행되는지 확인한다.
- [ ] 배포 후 health check가 동작하는지 확인한다.
- [ ] 실제 서버 환경에서 로그인 흐름을 검증한다.
- [ ] 실제 서버 환경에서 녹음 흐름을 검증한다.
- [ ] 실제 서버 환경에서 요약 흐름을 검증한다.
- [ ] 실제 서버 환경에서 저장 흐름을 검증한다.
- [ ] 실제 서버 환경에서 히스토리 조회 흐름을 검증한다.
- [ ] 실제 서버 환경에서 보안 이벤트 로그가 기록되는지 확인한다.
- [ ] fail2ban이 보안 로그를 감시하는지 확인한다.
- [ ] 반복된 인증 실패가 fail2ban 차단 대상이 되는지 확인한다.

### 14-3. 배포 체크리스트

- [ ] Oracle Cloud Always Free VM 사용 여부를 확정한다.
- [ ] Oracle 서버의 SSH 접속 정보를 정리한다.
- [ ] GitHub Actions 배포용 Secrets를 등록한다.
- [ ] 서버에 Node.js 런타임을 설치한다.
- [ ] 서버 환경 변수를 설정한다.
- [ ] `storage/meetings` 디렉터리를 생성한다.
- [ ] 서버 재시작 후 `storage/meetings` 파일 유지 여부를 확인한다.
- [ ] 보안 로그 디렉터리를 생성한다.
- [ ] 보안 로그 디렉터리 권한을 설정한다.
- [ ] fail2ban filter 파일을 배포한다.
- [ ] fail2ban jail 파일을 배포한다.
- [ ] fail2ban 점진 ban 설정을 적용한다.
- [ ] 보안 로그 logrotate 설정을 배포한다.
- [ ] Nginx가 실제 클라이언트 IP 헤더를 Next.js로 전달하도록 설정한다.
- [ ] 앱 포트가 외부에 직접 노출되지 않도록 방화벽 또는 reverse proxy 구성을 확인한다.
- [ ] Azure Speech 환경 변수를 설정한다.
- [ ] AI API 환경 변수를 설정한다.
- [ ] 프로세스 매니저 사용 여부를 결정한다.
- [ ] reverse proxy 설정 여부를 결정한다.
- [ ] 자동 배포 후 애플리케이션 재시작 방식을 확정한다.
- [ ] 자동 배포 실패 시 롤백 또는 중단 방식을 정리한다.
- [ ] `storage/meetings` 수동 백업 방식을 정리한다.

### 14-4. 완료 기준 체크리스트

- [ ] 전체 테스트가 통과한다.
- [ ] 커버리지 threshold를 충족한다.
- [ ] CI/CD workflow가 정상 동작한다.
- [ ] 테스트 실패 시 배포가 진행되지 않는다.
- [ ] 커버리지 threshold 미달 시 배포가 진행되지 않는다.
- [ ] 실제 서버 환경에서 `storage/meetings`가 유지된다.
- [ ] 실제 서버 환경에서 보안 로그가 유지된다.
- [ ] fail2ban이 보안 로그 기반으로 비정상 요청을 차단할 수 있다.
- [ ] 배포 후 로그인, 녹음, 요약, 저장, 히스토리 조회 흐름이 동작한다.
- [ ] 1인 사용 기준으로 실제 회의에서 PoC 검증이 가능하다.

---

## 15. 구현 순서 요약

1. 프로젝트 초기 세팅 및 테스트/CI/CD/보안 운영 기반 구축
2. 공통 기반 구현
3. 인증 구현
4. 파일 저장소 구현
5. 핵심 API 구현
6. 녹음 및 STT 구현
7. 전사 검토 및 요약 저장 플로우 구현
8. 히스토리 UI 구현
9. 저장된 회의 수정 및 삭제 구현
10. 에러 복구 및 안정화
11. 최종 검증 및 배포 안정화

---

## 16. MVP 완료 기준

MVP는 다음 조건을 만족하면 완료로 본다.

- [ ] 사용자가 로그인할 수 있다.
- [ ] 사용자가 회의 녹음을 시작할 수 있다.
- [ ] 사용자가 회의 녹음을 종료할 수 있다.
- [ ] Azure STT로 회의 내용을 transcript로 누적할 수 있다.
- [ ] 녹음 중 최근 10개 문장만 실시간 미리보기로 표시된다.
- [ ] 녹음 종료 후 transcript를 수정할 수 있다.
- [ ] 사용자가 제목을 입력할 수 있다.
- [ ] 사용자가 요약을 생성할 수 있다.
- [ ] 요약 결과는 `summary`, `keyPoints`로 생성된다.
- [ ] 회의 데이터가 서버 JSON 파일로 저장된다.
- [ ] 히스토리에서 캘린더 기반으로 회의를 조회할 수 있다.
- [ ] 저장된 회의를 상세 조회할 수 있다.
- [ ] 저장된 회의 transcript를 수정하고 재요약할 수 있다.
- [ ] 저장된 회의를 삭제할 수 있다.
- [ ] 요약 실패 시 사용자의 입력이 유지된다.
- [ ] 저장 실패 시 사용자의 입력이 유지된다.
- [ ] 녹음 중단 상황에서 사용자의 입력이 최대한 유지된다.
- [ ] 인증 실패와 의심스러운 요청이 보안 이벤트로 기록된다.
- [ ] fail2ban이 보안 이벤트 로그를 기반으로 반복적인 비정상 요청을 차단할 수 있다.
- [ ] 실제 1인 사용자가 월 5시간 이내 회의에서 사용할 수 있다.
