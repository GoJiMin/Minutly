# Minutly DB 설계

## 1. 문서 목적

이 문서는 Minutly의 Neon Postgres 기반 데이터 모델을 정의한다.

PRD의 저장 방향은 "회의록 1건을 하나의 영속 데이터 단위로 저장한다"는 전제를 따른다. MVP에서는 단일 사용자 서비스를 기준으로 하며, 회의 데이터 저장과 히스토리 조회에 필요한 최소 테이블만 정의한다.

---

## 2. 설계 원칙

- 최종 회의 데이터는 Neon Postgres에 저장한다.
- 회의록 1건은 `meetings` 테이블의 레코드 1개로 관리한다.
- `id`는 회의 레코드의 primary key로 사용한다.
- 날짜별 캘린더 표시는 `meeting_date` 컬럼을 기준으로 조회한다.
- `meeting_date`는 서비스 기준 날짜이며, 기본 시간대는 `Asia/Seoul`이다.
- `created_at`과 `updated_at`은 실제 생성 및 수정 시각을 나타낸다.
- DB 컬럼명은 Postgres 관례에 맞춰 `snake_case`를 사용한다.
- API 및 클라이언트 타입에서는 기존 명세 흐름에 맞춰 `camelCase`로 변환해 사용할 수 있다.

---

## 3. 테이블 개요

### 3-1. `meetings`

회의록 최종 저장 데이터를 관리하는 테이블이다.

| Column              | Type          | Null | 설명                                      |
| ------------------- | ------------- | ---- | ----------------------------------------- |
| `id`                | `uuid`        | no   | 회의 레코드 고유 식별자                   |
| `title`             | `text`        | no   | 회의 제목                                 |
| `meeting_date`      | `date`        | no   | 캘린더와 날짜별 목록 조회에 사용하는 날짜 |
| `created_at`        | `timestamptz` | no   | 회의 최초 저장 시각                       |
| `updated_at`        | `timestamptz` | no   | 회의 마지막 수정 또는 재요약 저장 시각    |
| `origin_transcript` | `text`        | no   | STT가 인식한 원본 전사 텍스트             |
| `transcript`        | `text`        | no   | 사용자가 검토 및 수정한 최종 전사 텍스트  |
| `summary`           | `text`        | no   | AI가 생성한 총 회의 요약                  |
| `key_points`        | `jsonb`       | no   | AI가 생성한 주요 사항 목록                |

---

## 4. DDL 초안

```sql
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  meeting_date date not null,

  created_at timestamptz not null,
  updated_at timestamptz not null,

  origin_transcript text not null,
  transcript text not null,
  summary text not null,
  key_points jsonb not null,

  constraint meetings_key_points_is_array
    check (jsonb_typeof(key_points) = 'array')
);
```

### 4-1. `meeting_date` 생성 규칙

- `meeting_date`는 `created_at`을 서비스 기준 시간대인 `Asia/Seoul`로 해석한 날짜다.
- 신규 회의 저장 시 서버는 요청 시점의 현재 시각을 기준으로 `created_at`, `updated_at`, `meeting_date`를 함께 생성한다.
- `created_at`, `updated_at`은 DB의 `now()` 기본값을 사용하지 않고 애플리케이션 서버에서 같은 시각 값을 전달한다.
- 예: `created_at = 2026-04-26T14:00:00+09:00`이면 `meeting_date = 2026-04-26`
- `meeting_date`는 캘린더 조회용 값이므로 `year`, `month`, `day` 컬럼을 별도로 저장하지 않는다.

---

## 5. 인덱스

```sql
create index meetings_meeting_date_idx
  on meetings (meeting_date);

create index meetings_meeting_date_created_at_idx
  on meetings (meeting_date, created_at asc);
```

### 5-1. 인덱스 목적

- `meetings_meeting_date_idx`
  - 특정 연월에서 회의가 있는 날짜를 조회할 때 사용한다.
  - `meeting_date >= month_start and meeting_date < next_month_start` 형태의 range query를 지원한다.
- `meetings_meeting_date_created_at_idx`
  - 특정 날짜의 회의 목록을 조회하고 `created_at asc`로 정렬할 때 사용한다.
- 상세 조회, 수정, 삭제는 primary key인 `id`로 처리한다.

---

## 6. 날짜 관리 방식

### 6-1. 물리 테이블

- 별도의 날짜 테이블은 만들지 않는다.
- `meetings` 테이블만으로 캘린더 강조 날짜와 날짜별 회의 목록을 조회한다.
- 논리적으로는 하나의 `meeting_date`에 여러 회의 레코드가 연결되는 1:N 구조다.

```txt
meeting_date 2026-04-02
  - meeting id A
  - meeting id B

meeting_date 2026-04-06
  - meeting id C

meeting_date 2026-04-24
  - meeting id D
```

### 6-2. 월별 조회 방식

월별 캘린더 조회는 `meeting_date`에 함수를 적용하지 않고 날짜 범위 조건으로 처리한다.

```sql
where meeting_date >= date '2026-04-01'
  and meeting_date < date '2026-05-01'
```

다음 방식은 기본 조회 방식으로 사용하지 않는다.

```sql
where extract(year from meeting_date) = 2026
  and extract(month from meeting_date) = 4
```

`meeting_date` 컬럼에 함수를 적용하면 일반적인 `meeting_date` 인덱스를 효율적으로 사용하기 어렵기 때문이다.

---

## 7. 대표 쿼리

### 7-1. 특정 연월에서 회의가 있는 날짜 조회

```sql
select
  distinct meeting_date::text as meeting_date
from meetings
where meeting_date >= date '2026-04-01'
  and meeting_date < date '2026-05-01'
order by meeting_date asc;
```

이 조회 결과는 히스토리 캘린더에서 회의가 있는 날짜를 강조 표시하는 데 사용한다.

### 7-2. 특정 날짜의 회의 목록 조회

```sql
select
  id,
  title
from meetings
where meeting_date = date '2026-04-02'
order by created_at asc;
```

이 조회 결과는 히스토리 화면에서 선택한 날짜의 회의 목록을 표시하는 데 사용한다.

### 7-3. 특정 회의 상세 조회

```sql
select
  id,
  title,
  meeting_date,
  created_at,
  updated_at,
  origin_transcript,
  transcript,
  summary,
  key_points
from meetings
where id = $1;
```

### 7-4. 신규 회의 저장

```sql
insert into meetings (
  title,
  meeting_date,
  created_at,
  updated_at,
  origin_transcript,
  transcript,
  summary,
  key_points
) values (
  $1,
  $2,
  $3,
  $3,
  $4,
  $5,
  $6,
  $7::jsonb
)
returning id, meeting_date::text as meeting_date;
```

`$2`는 서버에서 `Asia/Seoul` 기준으로 계산한 `meeting_date`다.
저장 API의 응답에는 후속 조회와 캘린더 갱신에 필요한 `id`, `meeting_date`만 사용한다.

### 7-5. 회의 수정 및 재요약 저장

```sql
update meetings
set
  title = $2,
  origin_transcript = $3,
  transcript = $4,
  summary = $5,
  key_points = $6::jsonb,
  updated_at = $7
where id = $1;
```

수정 저장 시 `created_at`과 `meeting_date`는 유지한다.
수정 저장 API는 성공 시 응답 본문을 반환하지 않는다.

### 7-6. 회의 삭제

```sql
delete from meetings
where id = $1;
```

MVP에서는 soft delete를 사용하지 않고 실제 레코드를 삭제한다.

---

## 8. API 매핑

### 8-1. 특정 연월의 회의 날짜 목록

```http
GET /api/meetings/dates?year=YYYY&month=MM
```

- 서버는 `year`, `month`를 검증한다.
- 서버는 해당 월의 시작일과 다음 달 시작일을 계산한다.
- DB는 `meeting_date >= month_start and meeting_date < next_month_start` 조건으로 조회한다.
- 응답은 캘린더에서 강조할 날짜 목록을 반환한다.

### 8-2. 특정 날짜의 회의 목록

```http
GET /api/meetings?date=YYYY-MM-DD
```

- 서버는 `date`를 검증한다.
- DB는 `meeting_date = date` 조건으로 조회한다.
- 목록은 `created_at asc`로 정렬한다.

### 8-3. 특정 회의 상세, 수정, 삭제

DB 기준으로 상세 조회, 수정, 삭제는 `id` 하나로 식별할 수 있다.

```http
GET    /api/meetings/{id}
PUT    /api/meetings/{id}
DELETE /api/meetings/{id}
```

파일 저장 방식에서 필요했던 `date + id` 조합은 DB primary key 구조에서는 필요하지 않다. API 명세를 후속 수정할 때 상세 조회, 수정, 삭제 endpoint는 `id` 단독 식별로 전환한다.

---

## 9. API 타입 매핑

DB 컬럼은 `snake_case`, API 응답은 `camelCase`로 매핑한다.

| DB Column           | API Field          |
| ------------------- | ------------------ |
| `id`                | `id`               |
| `title`             | `title`            |
| `meeting_date`      | `meetingDate`      |
| `created_at`        | `createdAt`        |
| `updated_at`        | `updatedAt`        |
| `origin_transcript` | `originTranscript` |
| `transcript`        | `transcript`       |
| `summary`           | `summary`          |
| `key_points`        | `keyPoints`        |

---

## 10. 제외 범위

- MVP에서는 `users`, `accounts`, `teams` 테이블을 만들지 않는다.
- MVP에서는 사용자 소유권 컬럼을 만들지 않는다.
- `meeting_dates`, `meeting_year`, `meeting_month`, `meeting_day` 테이블 또는 컬럼을 만들지 않는다.
- `key_points`는 별도 테이블로 정규화하지 않고 `jsonb`로 저장한다.
- 보안 이벤트 저장 테이블은 이 문서의 MVP 범위에서 제외한다.
- 오디오 원본 파일은 저장하지 않는다.

---

## 11. 결정 사항

- `meetings.id`를 primary key로 사용한다.
- `meetings.meeting_date`를 캘린더 조회 기준으로 사용한다.
- 월별 조회는 `meeting_date`의 range query로 처리한다.
- 같은 날짜의 회의 목록은 `created_at asc`로 정렬한다.
- 상세 조회, 수정, 삭제는 `id` 단독 식별을 기준으로 설계한다.
- 회의 삭제는 row 삭제로 처리한다.
