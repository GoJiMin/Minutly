# Minutly 개발 계획서

## 1. 문서 목적

이 문서는 Minutly의 PRD, DB 설계서, 기능 명세서, API 명세서를 바탕으로 실제 개발 순서를 정의한다.

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

#### 저장소

- Neon Postgres

#### 테스트

- Jest
- React Testing Library

#### 배포 및 CI/CD

- Vercel
- GitHub Actions (테스트 및 커버리지 검증)

### 2-2. 핵심 저장 규칙

- 최종 회의 데이터는 Neon Postgres의 `meetings` 레코드로 저장한다.
- 회의 1건은 DB 레코드 1개로 관리한다.
- 회의 `id`는 UUID 형식의 전역 고유 식별자를 사용한다.
- `meetingDate`는 캘린더 및 날짜별 조회 기준으로 사용한다.
- `meetingDate`는 `createdAt`을 `Asia/Seoul` 시간대로 해석해 생성한다.
- 상세 조회, 수정, 삭제는 UUID `id` 단독 식별을 사용한다.
- 날짜는 히스토리 목록 조회를 위한 필터로만 사용한다.

### 2-3. 핵심 API 규칙

- 에러 응답은 `{ title, detail, status }` 구조를 사용한다.
- 반환 본문이 없는 성공 응답은 `204 No Content`를 사용한다.
- 보호된 API 요청은 Route Handler 내부에서 토큰 유효성을 검증한다.
- 보호된 API에서 refresh 시도가 가능한 인증 만료 상태는 `TOKEN_EXPIRED`로 응답한다.
- 보호된 API에서 인증 정보가 없거나 유효하지 않고 refresh 시도도 불가능한 상태는 `UNAUTHORIZED`로 응답한다.
- 클라이언트는 모든 401에 refresh를 시도하지 않고 `TOKEN_EXPIRED`에 대해서만 refresh를 1회 시도한다.
- refresh API에서 refresh token 검증에 실패하면 `UNAUTHORIZED`로 응답한다.
- 회의 상세, 수정, 삭제 endpoint는 `/api/meetings/{id}` 형식을 따른다.
- 히스토리 날짜 목록은 `meeting_date` range query로 조회한다.
- 특정 날짜 회의 목록은 `meeting_date = date` 조건과 `created_at asc` 정렬을 사용한다.

### 2-4. MVP 보안 원칙

- 단일 로그인 정보(`id`/`password`) 인증으로 서비스 접근을 제한한다.
- 인증 토큰은 `httpOnly` 쿠키로 관리한다.
- 보호된 페이지 접근 제어는 Next.js Proxy에서 수행한다.
- 보호된 Route Handler는 토큰 유무와 유효성을 별도로 검증한다.
- 인증 에러 응답은 로그인 실패 원인과 refresh token 검증 실패 원인을 상세히 노출하지 않는다.
- Vercel 기본 보호 기능을 우선 사용한다.
- 앱 레벨 감사 테이블과 rate limit은 MVP 이후 확장 후보로 둔다.

### 2-5. 테스트 및 배포 원칙

- 각 Phase의 주요 기능 구현 직후 해당 기능을 검증하는 테스트를 함께 작성한다.
- 테스트 도구는 Jest와 React Testing Library를 사용한다.
- CI에서는 테스트와 커버리지 검사를 실행한다.
- 커버리지 threshold 이하로 떨어지면 CI가 실패해야 한다.
- Vercel 배포는 테스트/커버리지 검증을 통과한 브랜치를 기준으로 진행한다.
- 배포 환경 변수는 Vercel에서 관리한다.

---

## 3. 전체 개발 단계 요약

| Phase    | 이름                               | 목표                                                                     |
| -------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Phase 0  | 프로젝트 초기 세팅                 | Next.js, TypeScript, FSD, 테스트, CI, Vercel/Neon 환경 준비              |
| Phase 1  | 공통 기반 구현                     | 공통 타입, API 클라이언트, 에러 응답, 검증, 날짜, localStorage 유틸 구축 |
| Phase 2  | 인증 구현                          | 로그인 정보 검증, 토큰 발급/갱신, Proxy 보호, API 인증 검증 구현         |
| Phase 3  | 회의 DB 저장 기능 구현             | `meetings` 레코드 생성/조회/수정/삭제와 날짜별 조회 구현                 |
| Phase 4  | 핵심 API 구현                      | Speech token, summary, meetings API 구현                                 |
| Phase 5  | 녹음 및 STT 구현                   | Azure Speech SDK 연결, 최근 10개 문장 미리보기, draft autosave 구현      |
| Phase 6  | 전사 검토 및 요약 저장 플로우 구현 | transcript review, title 입력, 요약 생성, 회의 저장 구현                 |
| Phase 7  | 히스토리 UI 구현                   | 캘린더, 날짜별 목록, 상세 조회 구현                                      |
| Phase 8  | 저장된 회의 수정/삭제 구현         | transcript 편집, 재요약, 회의 레코드 갱신, 삭제 모달 구현                |
| Phase 9  | 에러 복구 및 안정화                | draft 복구, summary snapshot 복구, 에러 바운더리, 테스트 보강            |
| Phase 10 | 최종 검증 및 배포 안정화           | 테스트/CI/Vercel 배포/Neon 연결/주요 사용자 흐름 최종 검증               |

---

## 4. Phase 0. 프로젝트 초기 세팅

### 4-1. 목표

Next.js와 TypeScript 기반으로 Minutly 프로젝트의 기본 구조를 생성한다.

기능 구현 전에 테스트 인프라, CI, Vercel 배포 환경, Neon Postgres 연결 준비를 먼저 정리해 이후 기능이 검증 가능한 상태에서 개발될 수 있도록 한다.

### 4-2. 작업 체크리스트

#### Project Setup

- [x] Next.js 최신 버전 프로젝트를 생성한다.
- [x] TypeScript 설정을 적용한다.
- [x] ESLint 설정을 적용한다.
- [x] Prettier 설정을 적용한다.
- [x] 절대 경로 alias를 설정한다.
- [x] FSD 기본 디렉터리 구조를 생성한다.
- [x] React Query Provider를 애플리케이션에 연결한다.
- [x] 기본 레이아웃을 생성한다.
- [x] 전역 스타일을 설정한다.
- [x] `/login` 라우트를 생성한다.
- [x] `/` 라우트를 생성한다.
- [x] `/history` 라우트를 생성한다.
- [x] `.env.example` 파일을 작성한다.

#### Test / CI Setup

- [x] Jest 설정을 적용한다.
- [x] React Testing Library 설정을 적용한다.
- [x] jest setup 파일을 작성한다.
- [x] 테스트 실행 스크립트를 작성한다.
- [x] CI 테스트 실행 스크립트를 작성한다.
- [x] 커버리지 수집 설정을 적용한다.
- [x] 커버리지 threshold를 설정한다.
- [x] GitHub Actions 테스트 workflow를 작성한다.
- [x] 테스트 실패 시 CI가 실패하도록 설정한다.
- [x] 커버리지 threshold 미달 시 CI가 실패하도록 설정한다.

#### Vercel / Neon Setup

- [x] Vercel에서 현재 Git 저장소를 새 프로젝트로 import한다.
- [x] Vercel Production branch를 `main`으로 설정한다.
- [x] 기존 CI 워크플로우를 제거하고 Vercel Build Command로 테스트 및 빌드를 함께 적용한다.
- [x] Production 배포는 `main`, Preview 배포는 feature branch 또는 PR 기준으로 생성되도록 설정한다.
- [x] Neon에서 Minutly용 Postgres 프로젝트를 생성한다.
- [x] Vercel runtime에서 사용할 Neon DB 접속 문자열을 Vercel 환경 변수(`DATABASE_URL`)로 등록한다.
- [x] 로컬 개발용 `.env.local`에 `DATABASE_URL`을 설정한다.
- [x] `.env.example`에 `DATABASE_URL` placeholder를 추가한다.
- [x] Azure Speech 환경 변수를 `.env.example`에 등록한다.
- [x] AI API 환경 변수를 `.env.example`에 등록한다.
- [x] 배포 후 `/`, `/login`, `/history` 접근으로 기본 route를 확인한다.

### 4-3. 예상 디렉터리

```txt
app/ => Next.js 기본 App Router
  /history
  /login
src/ => FSD 아키텍처 구성 디렉터리
  app/
  views/
    main/
    history/
    login/
  widgets/ => 상황에 따라 제거 가능
  features/
  entities/
  shared/
```

### 4-4. 완료 기준 체크리스트

- [x] 개발 서버가 정상 실행된다.
- [x] 기본 라우트(`/`, `/login`, `/history`)가 생성되어 있다.
- [x] FSD 디렉터리 구조가 준비되어 있다.
- [x] React Query Provider가 애플리케이션에 연결되어 있다.
- [x] Jest와 React Testing Library로 테스트를 실행할 수 있다.
- [x] 커버리지 threshold 미달 시 CI가 실패한다.
- [x] Vercel 프로젝트가 현재 Git 저장소와 연결되어 있다.
- [x] Vercel Production/Preview 배포 기준이 설정되어 있다.
- [x] Neon Postgres 프로젝트, database, role, connection string 기준이 정리되어 있다.
- [x] Neon Postgres 연결에 필요한 `DATABASE_URL` 환경 변수가 등록되어 있다.
- [x] 배포 환경에서 필요한 secret 항목이 `.env.example`과 문서에 반영되어 있다.

---

## 5. Phase 1. 공통 기반 구현

### 5-1. 목표

API, 에러, 검증, 날짜 포맷, meetingDate, localStorage 접근 유틸 등 이후 단계에서 반복 사용될 공통 기반을 만든다.

### 5-2. 작업 체크리스트

#### API / Error Foundation

- [x] `ErrorResponse` 타입을 정의한다.
- [x] API 에러 응답 파서를 구현한다.
- [x] 공통 fetch wrapper를 구현한다.
- [x] 공통 에러 응답 생성 유틸을 구현한다.
- [x] zod 기반 request body 검증 유틸을 구현한다.
- [x] zod 기반 query parameter 검증 유틸을 구현한다.
- [x] zod 기반 route parameter 검증 유틸을 구현한다.

#### Date Foundation

- [x] `YYYY-MM-DD` 날짜 포맷 유틸을 구현한다.
- [x] `[YYYY-MM-DD. 요일]` 제목 prefix 유틸을 구현한다.
- [x] 조회 대상 월의 시작일을 계산하는 유틸을 구현한다.
- [x] 조회 대상 월의 다음 달 시작일을 계산하는 유틸을 구현한다.

#### Storage Foundation

- [x] `localStorage` read 유틸을 구현한다.
- [x] `localStorage` write 유틸을 구현한다.
- [x] `localStorage` remove 유틸을 구현한다.

### 5-3. 주요 타입

```ts
type ErrorResponse = {
  title: string;
  detail: string;
  status: number;
};
```

### 5-4. 테스트 체크리스트

- [x] `ErrorResponse` 타입 사용 케이스를 테스트한다.
- [x] API 에러 응답 파서를 테스트한다.
- [x] 공통 에러 응답 생성 유틸을 테스트한다.
- [x] request body 검증 유틸을 테스트한다.
- [x] query parameter 검증 유틸을 테스트한다.
- [x] route parameter 검증 유틸을 테스트한다.
- [x] 날짜 포맷 유틸을 테스트한다.
- [x] 제목 prefix 유틸을 테스트한다.
- [x] 월 시작일과 다음 달 시작일 계산을 테스트한다.
- [x] localStorage read/write/remove 유틸을 테스트한다.

### 5-5. 완료 기준 체크리스트

- [x] 성공 응답과 에러 응답을 일관되게 처리할 수 있다.
- [x] API 명세에 맞는 공통 에러 응답을 생성할 수 있다.
- [x] `meetingDate`와 월별 조회 범위를 생성할 수 있다.
- [x] 공통 localStorage 유틸로 JSON 직렬화 가능한 값을 저장, 조회, 삭제할 수 있다.

---

## 6. Phase 2. 인증 구현

### 6-1. 목표

1인 사용을 전제로 한 단일 로그인 정보(`id`/`password`) 인증과 보호된 페이지/API 접근 제어를 구현한다.

### 6-2. 구현 API

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/check
```

### 6-3. 작업 체크리스트

#### Auth Domain

- [x] 로그인 요청 schema를 정의한다.
- [x] auth token 용도 타입을 정의한다.
- [x] token 검증 결과 타입을 정의한다.
- [x] 로그인 정보 검증 유틸을 구현한다.
- [x] access token 발급 유틸을 구현한다.
- [x] refresh token 발급 유틸을 구현한다.
- [x] access token 검증 유틸을 구현한다.
- [x] refresh token 검증 유틸을 구현한다.
- [x] 인증 쿠키 설정 유틸을 구현한다.
- [x] 인증 쿠키 제거 유틸을 구현한다.
- [x] Route Handler용 `requireAuth` 유틸을 구현한다.

#### Auth API

- [x] `POST /api/auth/login` Route Handler를 구현한다.
- [x] `POST /api/auth/refresh` Route Handler를 구현한다.
- [x] `POST /api/auth/logout` Route Handler를 구현한다.
- [x] `GET /api/auth/check` Route Handler를 구현한다.
- [x] 로그인 성공 시 access token 쿠키를 발급한다.
- [x] 로그인 성공 시 refresh token 쿠키를 발급한다.
- [x] access token 유효 기간 1시간을 적용한다.
- [x] refresh token 유효 기간 4주를 적용한다.
- [x] 인증 실패 시 `UNAUTHORIZED`와 `TOKEN_EXPIRED` 기준에 맞는 에러 응답을 반환한다.

#### Proxy / UI

- [x] Next.js Proxy에서 보호 페이지 접근을 검사한다.
- [x] 인증되지 않은 사용자를 `/login`으로 리다이렉트한다.
- [x] 로그인 mutation을 구현한다.
- [x] 인증 상태 확인 query를 `GET /api/auth/check` 기반으로 구현한다.
- [x] 로그인 페이지 UI를 구현한다.
- [x] 로그인 성공 시 메인 화면으로 이동한다.

### 6-4. 보호 대상

- `/`
- `/history`
- 보호된 `/api/*` Route Handler

### 6-5. 테스트 체크리스트

- [x] 로그인 정보 검증을 테스트한다.
- [x] credentials 검증 성공/실패 케이스를 테스트한다.
- [x] access token 발급을 테스트한다.
- [x] refresh token 발급을 테스트한다.
- [x] access token 검증 성공/실패 케이스를 테스트한다.
- [x] refresh token 검증 성공/실패 케이스를 테스트한다.
- [x] `requireAuth` 인증 성공/실패 케이스를 테스트한다.
- [x] `TOKEN_EXPIRED` 응답 시 fetcher가 refresh 요청 후 원 요청을 재시도하는지 테스트한다.
- [x] refresh 요청 실패 시 fetcher가 refresh 실패 에러를 전파하는지 테스트한다.
- [x] 로그인 폼 렌더링을 테스트한다.
- [x] 로그인 폼 입력 schema 검증을 테스트한다.
- [x] 로그인 성공 시 메인페이지 이동을 테스트한다.

### 6-6. 완료 기준 체크리스트

- [x] 올바른 `id`와 `password` 입력 시 인증 쿠키가 발급된다.
- [x] 잘못된 로그인 정보 입력 시 401 에러가 반환된다.
- [x] 인증되지 않은 사용자는 보호된 페이지에 접근할 수 없다.
- [x] 보호된 API는 토큰 검증을 통과해야만 실행된다.
- [x] access token 만료 시 refresh token으로 재발급할 수 있다.

---

## 7. Phase 3. 회의 DB 저장 기능 구현

### 7-1. 목표

Neon Postgres를 사용해 회의 데이터를 저장하고, `meetingDate` 기준으로 히스토리 조회를 수행할 수 있게 만든다.

### 7-2. 저장 구조

- `meetings` 테이블을 사용한다.
- 회의 1건은 레코드 1개로 저장한다.
- 상세 조회, 수정, 삭제는 UUID `id`로 처리한다.
- 캘린더 강조 날짜는 `meeting_date` 기준으로 조회한다.

### 7-3. 작업 체크리스트

#### DB Table Setup

- [x] `meetings` 테이블을 생성하는 SQL 파일을 작성한다.
- [x] `id`, `title`, `meeting_date`, `created_at`, `updated_at`, `origin_transcript`, `transcript`, `summary`, `key_points` 컬럼을 정의한다.
- [x] `id`는 `uuid primary key default gen_random_uuid()`로 정의한다.
- [x] `key_points` 컬럼에는 JSON 배열만 저장되도록 CHECK 제약을 추가한다.
- [x] 월별 캘린더 조회를 위해 `meeting_date` 인덱스를 추가한다.
- [x] 특정 날짜의 회의 목록 정렬을 위해 `(meeting_date, created_at asc)` 인덱스를 추가한다.
- [x] Neon SQL Editor에서 SQL을 실행한다.
- [x] Neon Table Editor에서 `meetings` 테이블이 생성됐는지 확인한다.
- [x] 테스트용 회의 레코드를 insert/select/delete 해서 기본 동작을 확인한다.

#### Meeting Model

- [x] `src/entities/meeting/model/types.ts` 파일에 회의 응답 타입을 정의한다.
- [x] `src/entities/meeting/model/schema.ts` 파일에 회의 요청 및 parameter 검증 schema를 정의한다.
- [x] 저장된 회의 상세 응답 타입 `MeetingDetail`을 정의한다.
- [x] 날짜별 회의 목록 응답 타입 `MeetingListItem`을 정의한다.
- [x] 날짜별 회의 목록 응답 타입 `GetMeetingsByDateResponse`를 정의한다.
- [x] 월별 캘린더 날짜 응답 타입 `GetMeetingDatesResponse`를 정의한다.
- [x] 회의 생성 응답 타입 `CreateMeetingResponse`를 정의한다.
- [x] 회의 생성 요청 schema `createMeetingRequestSchema`를 정의한다.
- [x] 회의 수정 요청 schema `updateMeetingRequestSchema`를 정의한다.
- [x] `CreateMeetingRequest`와 `UpdateMeetingRequest` 타입은 zod schema에서 `z.infer`로 생성한다.
- [x] `/api/meetings/{id}`에서 사용할 UUID route params schema를 정의한다.
- [x] `GET /api/meetings?date=YYYY-MM-DD`에서 사용할 날짜 query schema를 정의한다.
- [x] `GET /api/meetings/dates?year=YYYY&month=MM`에서 사용할 월별 조회 query schema를 정의한다.
- [x] 날짜별 회의 목록 응답 타입은 `id`, `title`만 포함하도록 정의한다.

#### Meeting DB

- [x] `src/entities/meeting/server/meeting-db.ts` 파일에 `MeetingDb` interface를 정의한다.
- [x] `createMeeting(input)`은 저장 후 후속 조회에 필요한 `id`, `meetingDate`만 반환하도록 정의한다.
- [x] `getMeetingById(id)`는 회의 상세 또는 `null`을 반환하도록 정의한다.
- [x] `updateMeeting(id, input)`은 수정 여부를 `{updated: boolean}`으로 반환하도록 정의한다.
- [x] `deleteMeeting(id)`는 삭제 여부를 `{deleted: boolean}`으로 반환하도록 정의한다.
- [x] `listMeetingDates(year, month)`는 회의가 있는 날짜만 `YYYY-MM-DD` 배열로 반환하도록 정의한다.
- [x] `listMeetingsByDate(date)`는 날짜별 회의 목록을 반환하도록 정의한다.
- [x] 실제 Neon DB 구현체는 별도 파일에서 구현한다.
- [x] 실제 Neon DB 구현체 파일 상단에 `import 'server-only';`를 추가한다.
- [x] 실제 Neon DB 구현체 내부에서만 `@neondatabase/serverless`와 `neonConfig.databaseUrl`을 사용한다.
- [x] DB 조회 결과 row는 Neon DB 구현체 내부에서 API/도메인 타입의 `camelCase` 객체로 변환한다.
- [x] `createMeeting(input)`은 `title`, `originTranscript`, `transcript`, `summary`, `keyPoints`를 받아 `meetings`에 insert한다.
- [x] `createMeeting(input)`은 서버 현재 시각으로 `created_at`, `updated_at`을 만들고, `created_at` 기준 `meeting_date`를 계산해 저장한다.
- [x] `updateMeeting(id, input)`은 `title`, `originTranscript`, `transcript`, `summary`, `keyPoints`를 갱신한다.
- [x] `updateMeeting(id, input)`은 `created_at`과 `meeting_date`를 변경하지 않는다.
- [x] `updateMeeting(id, input)`은 서버 현재 시각으로 `updated_at`만 갱신한다.
- [x] `deleteMeeting(id)`는 `id`로 회의 레코드를 hard delete한다.
- [x] `listMeetingDates(year, month)`는 월 시작일과 다음 달 시작일을 계산해 `meeting_date` range query를 실행한다.
- [x] `listMeetingsByDate(date)`는 특정 `meeting_date`의 회의 목록을 `created_at asc`로 반환한다.
- [x] `listMeetingsByDate(date)`는 상세 본문 필드인 `originTranscript`, `transcript`, `summary`, `keyPoints`를 조회하지 않는다.

### 7-4. 대표 조회 규칙

```sql
-- 특정 연월에서 회의가 있는 날짜 조회
where meeting_date >= month_start
  and meeting_date < next_month_start

-- 특정 날짜의 회의 목록 조회
where meeting_date = selected_date
order by created_at asc

-- 특정 회의 상세 조회
where id = meeting_id
```

### 7-5. 테스트 체크리스트

- [x] 날짜 query schema가 `YYYY-MM-DD` 형식과 실제 존재 날짜를 검증하는지 테스트한다.
- [x] 월별 조회 query schema가 `YYYY`, `MM` 형식과 `01`-`12` 범위를 검증하는지 테스트한다.

### 7-6. 완료 기준 체크리스트

- [x] `meetings` 테이블과 인덱스를 생성하는 SQL 파일이 작성되어 있다.
- [x] Neon SQL Editor에서 `meetings` 테이블과 인덱스를 생성했다.
- [x] 회의 생성/수정 요청 데이터를 검증할 수 있다.
- [x] 회의 조회용 `id`, `date`, `year`, `month` 값을 검증할 수 있다.
- [x] 회의 상세 응답 타입 `MeetingDetail`이 정의되어 있다.
- [x] 날짜별 회의 목록 응답 타입 `MeetingListItem`은 `id`, `title`만 포함한다.
- [x] 회의 생성 응답 타입 `CreateMeetingResponse`는 `id`, `meetingDate`만 포함한다.
- [x] `MeetingDb` interface가 정의되어 있다.
- [x] `NeonMeetingDb` 구현체가 정의되어 있다.
- [x] `NeonMeetingDb`는 `@neondatabase/serverless`와 `neonConfig.databaseUrl`을 내부에서만 사용한다.
- [x] `NeonMeetingDb.createMeeting`은 회의 데이터를 insert하고 `id`, `meetingDate`를 반환한다.
- [x] `NeonMeetingDb.getMeetingById`는 회의 상세 또는 `null`을 반환한다.
- [x] `NeonMeetingDb.updateMeeting`은 수정 여부를 `{updated: boolean}`으로 반환한다.
- [x] `NeonMeetingDb.deleteMeeting`은 삭제 여부를 `{deleted: boolean}`으로 반환한다.
- [x] `NeonMeetingDb.listMeetingDates`는 특정 연월에서 회의가 있는 날짜 목록을 반환한다.
- [x] `NeonMeetingDb.listMeetingsByDate`는 특정 날짜의 회의 목록을 `id`, `title`만 반환한다.
- [x] 날짜 및 월별 query schema unit test가 통과한다.
- [x] 프로젝트 build가 통과한다.

---

## 8. Phase 4. 핵심 API 구현

### 8-1. 목표

API 명세서에 정의된 Speech, Summary, Meetings API를 구현한다.

### 8-2. 구현 API

```http
POST   /api/speech/token
POST   /api/summary
POST   /api/meetings
GET    /api/meetings/dates?year=YYYY&month=MM
GET    /api/meetings?date=YYYY-MM-DD
GET    /api/meetings/{id}
PUT    /api/meetings/{id}
DELETE /api/meetings/{id}
```

### 8-3. 작업 체크리스트

#### Speech Token API

- [x] Speech token 응답 타입을 정의한다.
- [x] Azure Speech token 발급 어댑터를 구현한다.
- [x] `POST /api/speech/token` Route Handler를 구현한다.
- [x] Speech token 응답에 `token`을 포함한다.
- [x] Speech token 응답에 `endpoint`를 포함한다.
- [x] Speech token 응답에 `Cache-Control: no-store` 헤더를 설정한다.

#### Summary API

- [x] `CreateSummaryRequest` 검증을 적용한다.
- [x] `SummaryProvider` interface를 정의한다.
- [x] Gemini 기반 `GeminiSummaryProvider` 구현체를 작성한다.
- [x] `SummaryService`에서 provider interface를 통해 요약을 생성한다.
- [x] AI 응답을 JSON으로 파싱하고 `summary`, `keyPoints`를 검증한다.
- [x] `POST /api/summary` Route Handler를 구현한다.

#### Meetings API

- [x] `POST /api/meetings` Route Handler를 구현한다.
- [x] `GET /api/meetings/dates` Route Handler를 구현한다.
- [x] `GET /api/meetings?date=...` Route Handler를 구현한다.
- [x] `GET /api/meetings/{id}` Route Handler를 구현한다.
- [x] `PUT /api/meetings/{id}` Route Handler를 구현한다.
- [x] `DELETE /api/meetings/{id}` Route Handler를 구현한다.
- [x] 신규 저장 응답에 `id`를 반환한다.
- [x] 신규 저장 응답에 `meetingDate`를 반환한다.
- [x] 수정 저장 성공 시 `204 No Content`를 반환한다.
- [x] 삭제 성공 시 `204 No Content`를 반환한다.
- [x] 모든 보호 API에서 `requireAuth`를 호출한다.

### 8-4. 검증 체크리스트

Phase 4의 Route Handler는 인증 쿠키, 외부 API, Neon Postgres를 함께 사용한다. MVP 단계에서는 E2E 테스트를 별도로 도입하지 않고, 자동 검증은 타입 검사, 빌드, 기존 테스트, 린트 기준으로 수행한다.

- [x] `pnpm test:ci`가 통과한다.
- [x] `pnpm lint`가 통과한다.
- [x] `pnpm build`가 통과한다.
- [x] Route Handler가 TypeScript type check를 통과한다.
- [x] 반환 본문이 없는 성공 응답은 `204 No Content`를 반환한다.

### 8-5. 수동 통합 검증 체크리스트

로컬 개발 서버와 실제 Neon Postgres를 사용해 curl 요청으로 검증한다. 검증에 사용한 테스트 회의는 삭제한다.

- [x] 로그인 API가 `204 No Content`를 반환하고 인증 쿠키를 발급한다.
- [x] 회의 저장 API로 테스트용 회의를 저장하고 반환된 `id`, `meetingDate`를 확인한다.
- [x] 저장한 회의를 상세 조회 API로 다시 조회할 수 있다.
- [x] 날짜별 회의 목록 API에 저장한 회의의 `id`, `title`이 포함된다.
- [x] 월별 회의 날짜 목록 API에 저장한 회의 날짜가 포함된다.
- [x] 회의 수정 API로 저장한 회의를 수정할 수 있다.
- [x] 수정 후 상세 조회에서 변경된 제목과 요약이 반영된다.
- [x] 회의 삭제 API로 저장한 회의를 삭제할 수 있다.
- [x] 삭제한 회의가 상세 조회 API에서 `MEETING_NOT_FOUND`로 처리된다.
- [x] 테스트용 회의 레코드를 삭제해 실제 Neon DB에 검증 데이터가 남지 않는다.

### 8-6. 완료 기준 체크리스트

- [x] API 명세의 모든 endpoint가 구현되어 있다.
- [x] 각 API는 명세된 요청/응답 타입을 따른다.
- [x] 성공 응답은 `data`로 감싸지 않는다.
- [x] 에러 응답은 `{ title, detail, status }` 형식을 따른다.
- [x] 반환 본문이 없는 성공 응답은 `204 No Content`를 반환한다.
- [x] 로컬 서버와 실제 Neon Postgres 기준 수동 통합 검증을 완료했다.

---

## 9. Phase 5. 녹음 및 STT 구현

### 9-1. 목표

브라우저에서 마이크 권한을 요청하고, 사용자가 선택한 마이크 입력을 Azure Speech SDK에 연결해 실시간 전사를 수행한다.

### 9-2. 작업 체크리스트

#### Speech Token / Azure SDK

- [x] `/api/speech/token`을 호출해 `{ token, endpoint }`를 받는 클라이언트 함수를 구현한다.
- [ ] Speech token 요청 실패 시 `RecordingErrorCode`를 `speech_token_failed`로 설정한다.
- [ ] Azure Speech SDK를 브라우저에서만 로드한다.
- [ ] Azure Speech SDK에 `token`, `endpoint`, `ko-KR` 언어 설정을 전달하는 함수를 구현한다.
- [ ] 선택된 `deviceId`로 `AudioConfig.fromMicrophoneInput(deviceId)`를 생성한다.
- [ ] Azure Speech recognizer를 생성하는 함수를 구현한다.
- [ ] Azure Speech recognizer의 `recognized`, `canceled`, `sessionStopped` 이벤트를 등록한다.
- [ ] 녹음 종료, 마이크 변경, STT 오류 발생 시 recognizer의 `stopContinuousRecognitionAsync`와 `close`를 호출한다.

#### Microphone Permission / Device

- [ ] `navigator.mediaDevices`가 없으면 `RecordingErrorCode`를 `microphone_api_unavailable`로 설정한다.
- [ ] 녹음 시작 버튼 클릭 시 `navigator.mediaDevices.getUserMedia({ audio: true })`를 호출한다.
- [ ] 마이크 권한 거부 시 `RecordingErrorCode`를 `microphone_permission_denied`로 설정한다.
- [ ] 마이크 권한 허용 후 `navigator.mediaDevices.enumerateDevices()`로 `audioinput` 장치 목록을 조회한다.
- [ ] `audioinput` 장치가 0개이면 `RecordingErrorCode`를 `microphone_not_found`로 설정한다.
- [ ] 기본 마이크는 첫 번째 `audioinput.deviceId`로 선택한다.
- [ ] 사용자가 선택한 `deviceId`를 recording 상태에 저장한다.
- [ ] 마이크 선택 `<select>`를 녹음 시작 전 화면에 표시한다.
- [ ] 사용자가 마이크를 변경하면 선택된 `deviceId`를 갱신한다.
- [ ] 녹음 중 마이크를 변경하면 기존 recognizer를 정리하고 새 `deviceId`로 recognizer를 다시 시작한다.
- [ ] 녹음 중 마이크 변경으로 전사가 끊긴 위치에 `[녹음 중단 구간]` chunk를 추가한다.

#### Recording Actions

- [ ] 녹음 시작 버튼 클릭 시 마이크 권한 확인, 마이크 목록 조회, Speech token 요청, recognizer 시작을 순서대로 실행한다.
- [ ] recognizer 시작 성공 후 `RecordingStatus`를 `recording`으로 설정한다.
- [ ] 녹음 시작 성공 시 recording draft를 즉시 저장한다.
- [ ] 녹음 종료 버튼 클릭 시 recognizer를 정리한다.
- [ ] 녹음 종료 버튼 클릭 시 최신 transcript를 recording draft로 즉시 저장한다.
- [ ] 녹음 종료 버튼 클릭 시 `RecordingStatus`를 `transcript_review`로 설정한다.
- [ ] 녹음 종료 버튼 클릭 시 전체 transcript chunk를 review transcript 문자열로 변환한다.
- [ ] 녹음 중에는 녹음 시작 버튼을 비활성화한다.
- [ ] 녹음 중에는 녹음 종료 버튼을 활성화한다.

#### Transcript Chunks

- [ ] Azure `recognized` 이벤트에서 최종 인식 텍스트가 비어 있으면 chunk를 추가하지 않는다.
- [ ] Azure `recognized` 이벤트에서 최종 인식 텍스트가 있으면 `TranscriptChunk.kind`가 `speech`인 chunk를 추가한다.
- [ ] 추가된 chunk는 `id`, `text`, `kind`, `createdAt` 값을 포함한다.
- [ ] 전체 transcript chunk 배열에 새 chunk를 누적한다.
- [ ] preview chunk 배열에 새 chunk를 추가한다.
- [ ] preview chunk가 10개를 초과하면 가장 오래된 chunk를 제거한다.
- [ ] `[녹음 중단 구간]`은 `TranscriptChunk.kind`가 `interruption`인 chunk로 저장한다.
- [ ] review transcript 문자열은 전체 transcript chunk를 생성 순서대로 이어 붙여 만든다.

#### Recording Draft

- [ ] recording draft localStorage key를 `minutly:recording-draft:v1`로 정의한다.
- [ ] recording draft 타입을 정의한다.
- [ ] recording draft schema를 정의한다.
- [ ] recording draft에 `version`, `status`, `chunks`, `previewChunks`, `selectedDeviceId`, `startedAt`, `updatedAt`을 저장한다.
- [ ] recording draft 저장 유틸을 구현한다.
- [ ] recording draft 복원 유틸을 구현한다.
- [ ] recording draft 삭제 유틸을 구현한다.
- [ ] 녹음 중 60초마다 recording draft를 저장한다.
- [ ] transcript chunk가 1개 이상인 상태에서 새로고침 후 재진입하면 draft 복구 안내를 표시한다.
- [ ] 사용자가 draft 복구를 선택하면 `chunks`, `previewChunks`, `selectedDeviceId`를 recording 상태에 반영한다.
- [ ] 사용자가 draft 삭제를 선택하면 `minutly:recording-draft:v1`을 삭제한다.

#### Recording Screen UI

- [ ] 메인 화면에 현재 `RecordingStatus` 텍스트를 표시한다.
- [ ] 메인 화면에 마이크 선택 `<select>`를 표시한다.
- [ ] 메인 화면에 녹음 시작 버튼을 표시한다.
- [ ] 메인 화면에 녹음 종료 버튼을 표시한다.
- [ ] 녹음 중에는 최근 10개 preview chunk를 생성 순서대로 표시한다.
- [ ] preview chunk가 없고 녹음 중이면 대기 문구를 표시한다.
- [ ] 마이크 권한 거부 시 브라우저 권한 허용 안내를 표시한다.
- [ ] 마이크 장치가 없으면 사용 가능한 마이크가 없다는 안내를 표시한다.
- [ ] STT 중단 시 다시 녹음 시작 버튼을 표시한다.
- [ ] draft가 있으면 임시 저장된 전사 복구 버튼과 삭제 버튼을 표시한다.

#### Recording Error

- [ ] Azure `canceled` 이벤트 발생 시 `RecordingErrorCode`를 `speech_recognition_canceled`로 설정한다.
- [ ] Azure `sessionStopped` 이벤트가 사용자의 녹음 종료 없이 발생하면 `RecordingErrorCode`를 `speech_session_stopped`로 설정한다.
- [ ] STT 오류 발생 시 recognizer를 정리한다.
- [ ] STT 오류 발생 시 현재 transcript를 recording draft로 즉시 저장한다.
- [ ] STT 오류 발생 시 `RecordingStatus`를 `error`로 설정한다.
- [ ] 다시 녹음 시작 버튼 클릭 시 `[녹음 중단 구간]` chunk를 추가한다.
- [ ] 다시 녹음 시작 버튼 클릭 시 기존 transcript chunk 뒤에 새 인식 결과를 이어서 추가한다.
- [ ] 다시 녹음 시작 버튼 클릭 시 기존 preview chunk를 유지하고 10개 제한을 다시 적용한다.

### 9-3. 주요 타입

```ts
type RecordingStatus = 'idle' | 'recording' | 'transcript_review' | 'summarizing' | 'completed' | 'error';

type RecordingErrorCode =
  | 'microphone_api_unavailable'
  | 'microphone_permission_denied'
  | 'microphone_not_found'
  | 'speech_token_failed'
  | 'speech_recognition_canceled'
  | 'speech_session_stopped';

type TranscriptChunk = {
  id: string;
  text: string;
  kind: 'speech' | 'interruption';
  createdAt: string;
};

type RecordingDraft = {
  version: 1;
  status: Extract<RecordingStatus, 'recording' | 'transcript_review' | 'error'>;
  chunks: TranscriptChunk[];
  previewChunks: TranscriptChunk[];
  selectedDeviceId: string | null;
  startedAt: string;
  updatedAt: string;
};
```

### 9-4. 테스트 체크리스트

- [ ] Speech token API 클라이언트 함수를 테스트한다.
- [ ] Speech token 요청 실패 시 `speech_token_failed`가 설정되는지 테스트한다.
- [ ] 마이크 권한 거부 시 `microphone_permission_denied`가 설정되는지 테스트한다.
- [ ] 마이크 장치가 없으면 `microphone_not_found`가 설정되는지 테스트한다.
- [ ] 마이크 목록에서 첫 번째 `audioinput.deviceId`가 기본 선택되는지 테스트한다.
- [ ] 사용자가 선택한 `deviceId`로 Azure `AudioConfig`가 생성되는지 테스트한다.
- [ ] 녹음 중 마이크 변경 시 기존 recognizer 정리 함수가 호출되는지 테스트한다.
- [ ] 녹음 중 마이크 변경 시 새 `deviceId`로 recognizer 시작 함수가 호출되는지 테스트한다.
- [ ] Azure `recognized` 이벤트에서 빈 텍스트는 chunk로 추가되지 않는지 테스트한다.
- [ ] Azure `recognized` 이벤트에서 최종 인식 텍스트가 speech chunk로 추가되는지 테스트한다.
- [ ] 전체 transcript chunk 누적을 테스트한다.
- [ ] 최근 10개 문장 preview 유지 로직을 테스트한다.
- [ ] preview chunk가 10개를 초과하면 오래된 문장이 제거되는지 테스트한다.
- [ ] 전체 transcript chunk를 review transcript로 변환하는 함수를 테스트한다.
- [ ] 녹음 중 draft schema 검증을 테스트한다.
- [ ] 녹음 중 draft 저장/복원/삭제 유틸을 테스트한다.
- [ ] 녹음 시작 성공 시 draft가 즉시 저장되는지 테스트한다.
- [ ] 녹음 중 60초마다 draft 저장 함수가 호출되는지 테스트한다.
- [ ] 녹음 종료 시 draft 저장 함수가 호출되는지 테스트한다.
- [ ] 새로고침 후 draft가 있으면 복구 버튼이 표시되는지 테스트한다.
- [ ] STT 오류 발생 시 draft 저장 로직을 테스트한다.
- [ ] Azure `canceled` 이벤트 발생 시 `speech_recognition_canceled`가 설정되는지 테스트한다.
- [ ] Azure `sessionStopped` 이벤트가 사용자의 녹음 종료 없이 발생하면 `speech_session_stopped`가 설정되는지 테스트한다.
- [ ] 다시 녹음 시작 시 `[녹음 중단 구간]`이 추가되는지 테스트한다.
- [ ] 녹음 상태 전이를 테스트한다.
- [ ] 권한 거부 안내가 화면에 표시되는지 테스트한다.
- [ ] 마이크 장치 없음 안내가 화면에 표시되는지 테스트한다.
- [ ] STT 중단 안내와 다시 녹음 시작 버튼이 화면에 표시되는지 테스트한다.

### 9-5. 완료 기준 체크리스트

- [ ] 사용자가 녹음을 시작하고 종료할 수 있다.
- [ ] 사용자가 녹음에 사용할 마이크를 선택할 수 있다.
- [ ] 사용자가 녹음 중 마이크를 변경할 수 있다.
- [ ] 마이크 권한 거부, 마이크 장치 없음, STT 중단 상태가 화면에 표시된다.
- [ ] Azure STT 최종 인식 문장을 transcript로 누적할 수 있다.
- [ ] 화면에는 최근 10개 문장만 표시된다.
- [ ] 녹음 중 draft 데이터가 60초마다 저장된다.
- [ ] 녹음 종료 시 최신 transcript가 draft로 저장된다.
- [ ] 새로고침 후 recording draft를 복원하거나 삭제할 수 있다.
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
- [ ] `meetingDate` 기준 날짜/요일 prefix 표시를 구현한다.
- [ ] `[녹음 중단 구간]` 마커가 transcript에 표시되도록 한다.

#### Summary Request

- [ ] 제목 미입력 시 요약 생성 버튼을 비활성화한다.
- [ ] transcript가 비어 있을 때 요약 생성 버튼을 비활성화한다.
- [ ] transcript가 너무 짧을 때 요약 생성 버튼을 비활성화한다.
- [ ] 요약 직전 summary snapshot 타입을 정의한다.
- [ ] 요약 직전 summary snapshot schema를 정의한다.
- [ ] summary snapshot 저장 유틸을 구현한다.
- [ ] summary snapshot 복원 유틸을 구현한다.
- [ ] summary snapshot 삭제 유틸을 구현한다.
- [ ] 요약 요청 직전 summary snapshot을 저장한다.
- [ ] `POST /api/summary` mutation을 구현한다.
- [ ] 요약 요청 중 `summarizing` 상태로 전환한다.
- [ ] 요약 실패 시 title을 유지한다.
- [ ] 요약 실패 시 transcript를 유지한다.

#### Meeting Save

- [ ] 요약 성공 후 `POST /api/meetings` mutation을 호출한다.
- [ ] 저장 응답의 `id`, `meetingDate`를 사용해 히스토리 화면으로 이동하거나 후속 조회를 수행한다.
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
- [ ] summary snapshot schema 검증을 테스트한다.
- [ ] summary snapshot 저장/복원/삭제 유틸을 테스트한다.
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
- [ ] 요약 요청 직전 summary snapshot을 저장할 수 있다.
- [ ] 요약 성공 후 회의 레코드가 저장된다.
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
- [ ] 회의 목록을 API 응답 순서대로 표시한다.
- [ ] 회의 목록 항목에 제목을 표시한다.
- [ ] 회의 목록 항목의 `id`로 상세 조회를 연결한다.

#### Meeting Detail

- [ ] 선택 회의 상태를 관리한다.
- [ ] 회의 선택 시 `/api/meetings/{id}` 상세 query를 실행한다.
- [ ] 우측 상세 영역에 제목을 표시한다.
- [ ] 우측 상세 영역에 `meetingDate`를 표시한다.
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
- [ ] 회의 목록이 API 응답 순서대로 표시되는지 테스트한다.
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
- [ ] 재요약 성공 후 `PUT /api/meetings/{id}` mutation을 호출한다.
- [ ] 수정 저장 성공 시 mutation에 전달한 `id`와 현재 화면 상태를 기준으로 관련 query를 갱신한다.
- [ ] 수정 저장 성공 시 meeting detail query를 invalidate한다.
- [ ] 수정 저장 성공 시 meetings by date query를 invalidate한다.

#### Delete

- [ ] 삭제 확인 모달을 구현한다.
- [ ] 삭제 확인 모달에 복구 불가 안내를 표시한다.
- [ ] 삭제 취소 액션을 구현한다.
- [ ] 삭제 확정 액션을 구현한다.
- [ ] `DELETE /api/meetings/{id}` mutation을 구현한다.
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
- [ ] 변경 사항이 있으면 다시 요약 후 기존 회의 레코드를 갱신할 수 있다.
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

각 Phase에서 작성된 테스트와 CI 흐름을 바탕으로 실제 배포 가능한 상태를 최종 검증한다.

Phase 10은 테스트를 한 번에 작성하는 단계가 아니라, 이미 작성된 테스트와 Vercel/Neon 연결이 실제 운영 흐름에서 동작하는지 확인하는 단계다.

### 14-2. 최종 검증 체크리스트

- [ ] 전체 테스트 스위트를 실행한다.
- [ ] 전체 테스트가 통과하는지 확인한다.
- [ ] 커버리지 threshold를 충족하는지 확인한다.
- [ ] CI에서 테스트가 자동으로 실행되는지 확인한다.
- [ ] CI에서 커버리지 threshold 미달 시 실패하는지 확인한다.
- [ ] Vercel 배포가 정상 완료되는지 확인한다.
- [ ] Vercel 배포 환경 변수가 올바르게 설정되어 있는지 확인한다.
- [ ] Neon Postgres 연결이 배포 환경에서 동작하는지 확인한다.
- [ ] DB schema 또는 migration이 적용되어 있는지 확인한다.
- [ ] 배포 후 기본 route 접근이 동작하는지 확인한다.
- [ ] 배포 후 기본 API 확인이 동작하는지 확인한다.
- [ ] 배포 환경에서 로그인 흐름을 검증한다.
- [ ] 배포 환경에서 녹음 흐름을 검증한다.
- [ ] 배포 환경에서 요약 흐름을 검증한다.
- [ ] 배포 환경에서 회의 저장 흐름을 검증한다.
- [ ] 배포 환경에서 히스토리 조회 흐름을 검증한다.
- [ ] 배포 환경에서 저장된 회의 수정/삭제 흐름을 검증한다.

### 14-3. 배포 체크리스트

- [ ] Vercel 프로젝트 연결을 확인한다.
- [ ] Vercel 환경 변수를 등록한다.
- [ ] `DATABASE_URL`을 등록한다.
- [ ] Azure Speech 환경 변수를 등록한다.
- [ ] AI API 환경 변수를 등록한다.
- [ ] 인증 관련 환경 변수를 등록한다.
- [ ] Neon Postgres connection string이 배포 환경에서 사용 가능한지 확인한다.
- [ ] DB schema 또는 migration 적용 절차를 정리한다.
- [ ] 배포 실패 시 Vercel에서 이전 배포로 되돌리는 절차를 정리한다.
- [ ] Neon Postgres 백업 또는 export 방식은 MVP 이후 운영 항목으로 남긴다.

### 14-4. 완료 기준 체크리스트

- [ ] 전체 테스트가 통과한다.
- [ ] 커버리지 threshold를 충족한다.
- [ ] CI workflow가 정상 동작한다.
- [ ] 테스트 실패 시 배포 대상 브랜치에 병합하지 않는다.
- [ ] 커버리지 threshold 미달 시 배포 대상 브랜치에 병합하지 않는다.
- [ ] Vercel 배포 환경에서 Neon Postgres 연결이 동작한다.
- [ ] 배포 후 로그인, 녹음, 요약, 저장, 히스토리 조회 흐름이 동작한다.
- [ ] 배포 후 저장된 회의 수정/삭제 흐름이 동작한다.
- [ ] 1인 사용 기준으로 실제 회의에서 PoC 검증이 가능하다.

---

## 15. 구현 순서 요약

1. 프로젝트 초기 세팅 및 테스트/CI/Vercel/Neon 기반 구축
2. 공통 기반 구현
3. 인증 구현
4. 회의 DB 저장 기능 구현
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
- [ ] 회의 데이터가 Neon Postgres의 `meetings` 레코드로 저장된다.
- [ ] 히스토리에서 `meetingDate` 기준 캘린더로 회의를 조회할 수 있다.
- [ ] 저장된 회의를 UUID `id`로 상세 조회할 수 있다.
- [ ] 저장된 회의 transcript를 수정하고 재요약할 수 있다.
- [ ] 저장된 회의를 삭제할 수 있다.
- [ ] 요약 실패 시 사용자의 입력이 유지된다.
- [ ] 저장 실패 시 사용자의 입력이 유지된다.
- [ ] 녹음 중단 상황에서 사용자의 입력이 최대한 유지된다.
- [ ] 실제 1인 사용자가 월 5시간 이내 회의에서 사용할 수 있다.
