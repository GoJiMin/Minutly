# Minutly

Minutly는 1인 사용을 전제로 개발된 회의 요약 서비스입니다. 회의 중 오간 대화를 실시간으로 수집해 텍스트로 변환(STT)하고, AI를 활용해 회의 요약과 주요 사항을 생성합니다.

## Minutly가 해결하는 문제

회의 시간이 짧을 때는 주요 내용을 기억하거나 간단히 메모하는 것만으로도 충분할 수 있습니다. 하지만 회의가 30분, 40분 이상 길어지면 초반에 논의한 내용을 놓치거나 잊어버리기 쉽습니다.

회의 내용을 계속 받아 적는 방식도 완전한 답이 되기는 어렵습니다. 메모에 신경을 쓰다 보면 대화에 바로 반응하기 어렵고 중요한 발언을 놓칠 수 있습니다.

회의가 끝난 뒤에도 해야 할 일이 남습니다. 대화 내용을 다시 떠올리고, 핵심 내용을 요약하고, 주요 사항을 따로 작성해야 합니다. 이 작업에는 회의 시간과 별개로 추가 시간이 들어갑니다.

회의록을 날짜별로 보관하지 않으면 나중에 이전 회의 내용을 다시 찾기도 어렵습니다. 회의록을 보냈던 메일을 검색하거나, 메신저에서 공유된 문서를 다시 찾거나, 따로 적어둔 메모를 뒤져야 합니다. 특정 날짜에 어떤 회의를 했고, 그 회의에서 어떤 이야기가 오갔는지 확인하는 데에도 시간이 걸립니다.

Minutly는 이 불편을 줄이기 위해 만들어졌습니다. 사용자는 회의가 시작될 때 녹음 버튼을 누르기만 하면 됩니다. Minutly는 대화 내용을 실시간으로 텍스트화하고, 회의가 끝난 뒤 AI를 통해 요약과 주요 사항을 생성합니다. 저장된 회의록은 캘린더에서 날짜별로 확인할 수 있고 이전 회의 내용도 필요할 때 다시 열어볼 수 있습니다.

## 주요 기능

### 1. 단일 사용자 로그인

<img width="3080" height="1974" alt="로그인" src="https://github.com/user-attachments/assets/88a0c21f-f3e8-4479-b528-0fc1dddb53e0" />

회의록에는 내부 논의, 의사 결정, 일정, 개인 메모처럼 외부에 노출되면 안 되는 내용이 포함될 수 있습니다. Minutly는 1인 사용을 전제하기 때문에 별도의 회원가입, 팀 초대, 사용자 관리 기능을 제공하지 않습니다.

사용자는 로그인 화면에서 아이디와 비밀번호를 입력합니다. 서버는 입력된 값이 환경 변수에 등록된 아이디와 비밀번호와 일치하는지 확인하고 인증된 사용자에게만 서비스 접근을 허용합니다.

### 2. 마이크 선택

<img width="3206" height="2056" alt="마이크선택" src="https://github.com/user-attachments/assets/9615b2d3-bbfa-4fc9-a1da-3e1a7a138572" />

녹음 전 사용할 마이크를 선택할 수 있습니다. 최초 접근 시 마이크 접근 권한을 요청하며 권한 부여 시 현재 연결된 마이크 목록을 표시하며 녹음에 사용할 마이크를 선택할 수 있습니다.

### 3. 회의 녹음 및 실시간 전사

<img width="3206" height="2056" alt="실시간전사" src="https://github.com/user-attachments/assets/d85aa199-b37a-4ef7-aee1-7452d49e99f9" />

회의가 시작되면 녹음 버튼을 눌러 대화 수집을 시작합니다. 녹음 중에는 현재 상태와 녹음 시간을 확인할 수 있습니다. 녹음 중 일시 정지 및 이어서 녹음이 가능하며 녹음을 종료하고 싶다면 녹음 종료 버튼을 클릭합니다.

회의 중 오간 대화는 Azure Speech를 통해 텍스트로 변환됩니다. 화면에는 최근 인식된 문장이 최대 10개까지 표시되며 사용자가 녹음이 정상적으로 진행되고 있는지 확인할 수 있습니다.

### 4. 전사 내용 확인 및 수정

<img width="3206" height="2056" alt="전사검토" src="https://github.com/user-attachments/assets/be6593d4-b171-4176-9068-dc57367f486b" />

녹음이 끝나면 전체 전사 내용을 확인할 수 있습니다. 잘못 인식된 문장이나 일시 정지 혹은 문제가 생겨 녹음이 중단된 구간이 있다면 빠진 내용을 사용자에게 마커로 제공하며 직접 수정한 뒤 AI 요약을 요청할 수 있습니다.

### 5. AI 회의 요약 생성

<img width="1688" height="1028" alt="회의요약생성" src="https://github.com/user-attachments/assets/e5c0433e-9a76-41ec-9637-193b7c3bda4f" />

사용자가 최종 검토한 전사 내용을 AI에 전달해 회의 요약과 주요 사항을 생성합니다. 생성된 결과가 마음에 든다면 회의록으로 저장할 수 있습니다.

### 6. 날짜별 회의록 조회

<img width="3376" height="2056" alt="날짜별회의조회" src="https://github.com/user-attachments/assets/f13f682a-4919-4bfb-8f4d-e700dc8846bc" />

저장된 회의록은 캘린더에서 날짜별로 조회할 수 있습니다. 회의가 있었던 날짜는 캘린더에 강조 표시되며 회의가 있는 날짜를 선택하면 해당 날짜에 저장된 회의록을 다시 열어볼 수 있습니다.

### 7. 저장된 회의록 조회 및 관리

<img width="3376" height="2056" alt="회의록조회및관리" src="https://github.com/user-attachments/assets/045118af-9240-4f97-aa84-39811473088f" />

저장된 회의를 다시 확인할 수 있습니다. 사용자가 입력한 회의 제목, 요약, 주요 사항, 최종 회의 내용을 확인할 수 있습니다.

저장된 회의의 제목, 회의 요약, 주요 사항을 수정할 수 있으며 각 회의별로 개인 메모를 추가하거나 삭제할 수도 있습니다.

## 기술 스택

| 구분            | 기술             |
| --------------- | ---------------- |
| Framework       | Next.js          |
| Language        | TypeScript       |
| Database        | Neon PostgreSQL  |
| Speech-to-Text  | Azure Speech     |
| AI              | Google AI Studio |
| Deploy          | Vercel           |
| Package Manager | pnpm             |

## 기술 선정 이유

### Azure Speech

처음 기획 당시에는 브라우저에서 제공하는 음성 인식 API를 사용해 전사 기능을 구현하고자 했습니다. 별도의 외부 STT 서비스를 호출하지 않아도 되고 브라우저에서 마이크 입력을 바로 사용할 수 있어 비용 문제 없이 빠르게 구현할 수 있겠다고 판단했습니다.

하지만 간단한 PoC를 만들어 테스트해보니 실제 회의를 기록하기에는 한계가 있었습니다. 일부 브라우저에 의존해야 했고 말한 내용이 기대한 만큼 정확하게 전사되지 않는 경우도 있었습니다. 전사 품질이 낮으면 이후 요약 결과의 품질도 낮아질 수밖에 없었기 때문에 브라우저 API만으로 처리하는 방식을 포기하고 외부 STT 서비스를 도입하게 됐습니다.

**Google Cloud Speech-to-Text**나 **OpenAI의 transcription API**도 후보가 될 수 있었지만 무료 사용량이 제한적이거나 사용량에 따라 분당 과금이 발생했습니다. 이 프로젝트는 초기 프로토타입 운영 비용이 발생하지 않는 범위 안에서 실제 회의에 사용할 수 있어야 했기 때문에 두 후보는 제외했습니다.

**Azure Speech**는 F0 Free Tier에서 실시간 음성 전사를 월 5시간까지 무료로 제공합니다. 무료 등급에서는 동시에 처리할 수 있는 실시간 전사 요청 수가 제한(1회선)되지만 이 서비스는 지인 1명이 사용하는 것을 전제로 했고 월 회의 시간도 평균 5시간 이내였기 때문에 해당 제약은 문제가 되지 않았습니다.

### Google AI Studio

전사된 회의 내용을 종합해 요약을 대신 생성하려면 LLM 모델이 필요했습니다. 해당 기능도 운영 비용이 발생하지 않는 범위 내에서 구현해야 했기 때문에 먼저 여러 LLM 모델을 API 형식으로 제공하는 Groq을 사용하고자 했습니다.

Groq에서 사용할 수 있는 모델 중 `openai/gpt-oss-120b`는 무료 플랜 기준 분당 요청 제한(RPM) 30회, 일 요청 제한(RPD) 1K로 1인 서비스에서 사용하기 충분했습니다. 하지만 Free Plan 기준 분당 토큰 제한(TPM)이 8K로 회의 시간이 길어지거나 요약 프롬프트가 길어질 경우 토큰 제한에 걸릴 가능성이 높아 후보에서 제외했습니다.

다음 후보인 Google AI Studio의 `gemini-3-flash-preview` 모델은 사용 당시 확인한 무료 티어 기준 RPM 5회, RPD 20회로 비교적 낮지만 회의가 끝난 후 요약 생성에 한 번 사용한다는 점, 하루 회의가 1~2회인 점을 고려한다면 요청 횟수 제한은 문제가 되지 않았습니다. 반면 TPM을 250K까지 제공해 현재 프로젝트의 사용 방식에 더 알맞다고 판단했습니다.

또한 요약 결과는 자유 텍스트 하나로만 받는 것이 아니라 `summary`, `keyPoints`처럼 화면에서 바로 사용할 수 있는 형태로 받아야 했습니다. Gemini API는 필요한 응답 필드를 스키마로 제한하고 요약 결과를 일정하게 다루기에도 적합했습니다.

### Neon PostgreSQL

처음에는 DB를 사용하지 않고 회의록을 JSON 파일로 저장하려고 했습니다. 예를 들어 회의가 생성된 날짜와 시간을 기준으로 `2026-05-30/16-30-34.json` 형태로 저장하고 특정 날짜의 회의 목록은 해당 날짜 폴더의 파일을 읽어오는 방식으로 구현하고자 했습니다.

하지만 이 방식은 파일 시스템에 데이터를 영속적으로 저장할 수 있는 배포 환경이 필요했습니다. AWS는 장기적으로 무료 범위 내에서 유지하기 번거로웠고 오라클 클라우드는 계정 생성 단계에서 오류가 반복돼 프로젝트 진행이 지연됐습니다. 그래서 서버리스 환경에 배포한 뒤 회의 데이터는 별도 DB에 저장하는 방식으로 방향을 바꿨습니다.

DB 호스팅 서비스로 먼저 Supabase의 무료 플랜을 확인한 결과 저장 공간은 1인 사용 서비스에 충분했지만 일정 기간 요청이 없으면 프로젝트가 pause 될 수 있어 제외했습니다. Neon도 1인 사용 서비스에 충분한 무료 저장 공간을 제공했고, 요청이 없는 시간이 길어지면 DB가 잠시 대기 상태로 전환될 수는 있지만 새 요청이 들어올 때 다시 연결되는 방식이라 직접 복구해야 하는 부담이 적어 선택했습니다.

DB를 사용하기로 결정한 상태에서 NoSQL도 선택지가 될 수 있었습니다. 하지만 회의별로 개인 메모 기능이 추가되면서 회의와 메모 사이에 1:N의 관계가 생겼습니다. 회의 1건은 여러 개의 메모를 가질 수 있고, 메모는 반드시 특정 회의에 속해야 하며, 회의가 삭제되면 연결된 메모도 함께 삭제되어야 했습니다. 이런 관계를 어플리케이션 코드에서 직접 관리할 수도 있지만 관계형 데이터베이스를 사용하면 외래 키와 `ON DELETE CASCADE`로 데이터베이스 수준에서 처리하는 게 가능합니다.

또한 회의 목록은 날짜 기준으로 조회돼야 하고 같은 날짜의 회의는 생성 시각을 기준으로 정렬되어야 했습니다. 회의별 메모 역시 특정 회의에 속한 메모를 ID 순서대로 불러와야 했기 때문에 인덱스를 두고 조회 조건을 관리할 수 있는 관계형 데이터베이스가 더 적합하다고 판단했습니다.

### Next.js

Azure Speech, Google AI Studio, Neon을 사용하면서 외부 서비스 호출에 필요한 API Key와 DB 연결 정보가 생겼습니다. 이런 값을 브라우저에서 직접 다루면 클라이언트 코드에 노출될 수 있고 제한된 무료 사용량이 의도하지 않은 요청에 사용될 수도 있겠다고 생각했습니다.

또한 회의록에는 회사 내부 기밀이나 일정처럼 외부에 노출되면 안 되는 내용이 포함될 수 있기 때문에 유효한 사용자만 서비스에 접근할 수 있도록 서버에서 인증을 처리할 필요가 있었습니다. 단순하게 브라우저에서만 동작하는 클라이언트 앱으로는 API Key 관리, DB 접근, 사용자 인증을 안전하게 처리하기 어렵다고 판단했습니다.

그렇다고 별도의 Express, Fastify 서버를 새로 구성하기에는 서버가 맡아야 하는 역할이 크지 않았습니다. 이 프로젝트에서 서버는 주로 인증, Azure Speech 연결용 단기 토큰 발급, AI 요약 요청, DB 저장 및 조회 처리처럼 외부 서비스와 브라우저 사이에서 요청을 중계하는 역할이 컸습니다.

따라서 클라이언트 화면과 서버 API를 같은 프로젝트 내에서 관리할 수 있는 Next.js를 사용했습니다. 외부 서비스 연결에 필요한 값은 서버 환경 변수로만 관리하고 Next.js 서버를 통해 필요한 작업을 대신 요청하도록 구현했습니다.

### 사용자 인증

Minutly는 1인 사용을 전제로 했기 때문에 별도의 회원 테이블이나 회원가입 기능을 두지 않았습니다. 서비스에 접근할 수 있는 아이디와 비밀번호를 서버 환경 변수로 관리하고 로그인 요청이 들어오면 입력값을 환경 변수에 등록된 값과 비교합니다.

일반적인 문자열 비교는 값이 달라지는 지점에서 비교가 끝날 수 있어 입력값이 실제 값과 얼마나 앞부분이 일치하는지에 따라 응답 시간이 달라질 수 있습니다. 이 차이를 이용한 추측 가능성을 줄이고자 아이디, 비밀번호 비교에는 `timingSafeEqual`을 사용했습니다. 또한 반복해서 추측하는 공격을 방지하기 위해 로그인 요청은 5분 동안 5회까지만 시도할 수 있도록 rate limit을 설정했습니다.

로그인에 성공하면 서버는 서명된 JWT 형식의 액세스 토큰과 리프레시 토큰을 생성해 httpOnly 쿠키에 담아 브라우저에 전달합니다. 토큰을 로컬 스토리지나 메모리 상태로 관리하지 않은 이유는 사용자를 신뢰하지 않아서가 아니라 클라이언트 측 스크립트에서 토큰에 직접 접근 가능한 상황을 막기 위해서였습니다.

보호된 페이지 접근은 Next.js의 프록시에서 쿠키를 확인해 제한했습니다. 인증 정보가 없거나 유효하지 않은 사용자는 로그인 페이지로 이동시키고 인증된 사용자만 서비스 화면에 접근 가능합니다. API 요청은 각 라우트 핸들러가 인증 쿠키를 확인합니다. 페이지 접근을 통과하더라도 API가 직접 호출될 수 있기 때문에 실제 서버 작업을 처리하기 전에 유효한 사용자인지 마지막으로 판단합니다.

## 주요 요청 시퀀스 및 데이터베이스

### 인증

<div align="center">
  <img width="700" alt="인증" src="https://github.com/user-attachments/assets/a5678bce-925a-4397-b0eb-e03d3fa2d045" />
</div>

사용자가 로그인 정보를 입력하면 서버는 환경 변수의 인증 정보와 비교한 뒤 이후 요청에서 사용할 JWT를 httpOnly Cookie로 내려줍니다. 보호된 페이지와 API 요청은 쿠키에 담긴 인증 정보를 확인한 뒤 응답합니다.

### 실시간 전사 연결

<div align="center">
  <img width="700" alt="전사 연결" src="https://github.com/user-attachments/assets/22d0ca70-23db-402a-b73a-0f935747bb60" />
</div>

사용자가 녹음을 시작하면 브라우저는 서버에 STT 연결용 단기 토큰을 요청합니다. 서버는 Azure에서 Speech 연결용 단기 토큰을 발급받아 브라우저에 전달하고 브라우저는 해당 토큰으로 Azure Speech와 WebSocket으로 연결해 전사 결과를 실시간으로 전달받습니다.

### 전사 검토 및 요약 생성

<div align="center">
  <img width="700" alt="요약요청" src="https://github.com/user-attachments/assets/0bb8388a-3f17-4907-93d1-730aad88425e" />
</div>

녹음이 끝나면 브라우저는 누적된 전사 텍스트를 사용자에게 표시합니다. 사용자는 전사 내용을 확인하거나 수정한 뒤 요약 생성을 요청하고 서버는 Google AI Studio에 요약 생성을 요청해 받은 결과를 브라우저에 반환합니다.

### 저장 및 조회

<div align="center">
  <img width="700" alt="저장및조회" src="https://github.com/user-attachments/assets/90cbbef5-5196-439a-8686-a79a31e8fcce" />  
</div>

사용자는 생성된 회의 내용을 저장하거나 이전 기록을 조회할 수 있습니다. 브라우저는 서버에 저장 또는 조회를 요청하고 서버는 Neon PostgreSQL에 접근해 회의 데이터를 저장하거나 불러온 뒤 결과를 반환합니다.

### 데이터베이스

#### ERD

<div align="center">
  <img width="700" alt="erd" src="https://github.com/user-attachments/assets/b5130b4b-07ba-4cfb-abc6-1cc66ec0bd20" />
</div>

회의 1건은 여러 개의 개인 메모를 가질 수 있습니다. 개인 메모는 반드시 하나의 회의에 연결되고 회의가 삭제되면 해당 회의에 연결된 메모도 함께 삭제됩니다.

#### 테이블 (meetings)

<div align="center">

| 컬럼                | 설명                                           |
| ------------------- | ---------------------------------------------- |
| `id`                | 회의를 구분하는 UUID                           |
| `title`             | 회의 제목                                      |
| `meeting_date`      | 캘린더와 날짜별 목록 조회에 사용하는 회의 날짜 |
| `created_at`        | 회의가 처음 저장된 시각                        |
| `updated_at`        | 회의가 마지막으로 수정된 시각                  |
| `origin_transcript` | Azure Speech가 생성한 전사 원문                |
| `transcript`        | 사용자가 확인 및 수정한 전사 텍스트            |
| `summary`           | AI가 생성한 회의 요약                          |
| `key_points`        | AI가 생성한 주요 사항 목록                     |

</div>

회의 1건의 전사 원문, 사용자가 확인 및 수정한 전사 수정본, 요약 결과, 주요 사항을 저장합니다.

#### 테이블 (meeting_memos)

<div align="center">

| 컬럼         | 설명                              |
| ------------ | --------------------------------- |
| `id`         | 개인 메모를 구분하는 증가 숫자 ID |
| `meeting_id` | 메모가 속한 회의 ID               |
| `content`    | 개인 메모 내용                    |

</div>

저장된 회의에 연결되는 개인 메모를 저장합니다. `meeting_id`는 `meetings.id`를 참조합니다. `ON DELETE CASCADE`를 사용해 회의가 삭제되면 연결된 개인 메모도 함께 삭제됩니다.

#### 인덱스

<div align="center">

| 인덱스                                 | 사용 목적                                                     |
| -------------------------------------- | ------------------------------------------------------------- |
| `meetings_meeting_date_idx`            | 특정 날짜에 저장된 회의를 조회할 때 사용                      |
| `meetings_meeting_date_created_at_idx` | 특정 날짜의 회의 목록을 생성 시각 오름차순으로 조회할 때 사용 |
| `meeting_memos_meeting_id_id_idx`      | 특정 회의에 연결된 메모 목록을 ID 오름차순으로 조회할 때 사용 |

</div>

## 빠른 시작

Minutly를 로컬에서 실행하려면 Node.js, pnpm, Neon PostgreSQL, Azure Speech, Google AI Studio API Key가 필요합니다.

- [Node.js](https://nodejs.org/) `20.9.0` 이상
- [pnpm](https://pnpm.io/)
- [Neon](https://neon.com/) 계정
- [Azure](https://portal.azure.com/) 계정
- [Google AI Studio](https://aistudio.google.com/) 접근 가능 계정

저장소를 클론한 뒤 의존성을 설치합니다.

```bash
git clone <repository-url>
cd minutly

pnpm install
```

### 1. 외부 서비스 준비

#### Neon PostgreSQL

[Neon](https://neon.com/)에서 새 프로젝트를 만들고 PostgreSQL connection string을 복사합니다. 이 값은 `.env.local`의 `DATABASE_URL`에 입력합니다.

Neon connection string 확인 방법은 [Neon 공식 문서](https://neon.com/docs/get-started/connect-neon)를 참고할 수 있습니다.

#### Azure Speech

[Azure Portal](https://portal.azure.com/)에서 Speech 리소스를 생성합니다. 생성 시 Foundry Tools가 아닌 음성 서비스(Speech Service) 리소스를 생성합니다. 가격 측정 계층을 Free F0으로 설정 시 월 무료 5시간을 제공하며 Standard S0으로 설정 시 사용량에 비례한 요금을 지불하게 됩니다.

생성한 리소스의 key와 region을 확인한 뒤 각각 `.env.local`의 `AZURE_SPEECH_SECRET_KEY`, `AZURE_SPEECH_REGION`에 입력합니다.

`AZURE_SPEECH_REGION`에는 `koreacentral`, `westus`처럼 Azure Speech 리소스를 만든 region identifier를 입력합니다. Azure Speech는 key와 region이 서로 맞아야 인증에 성공합니다. region identifier는 [Azure Speech region 문서](https://learn.microsoft.com/azure/ai-services/speech-service/regions)에서 확인할 수 있습니다.

`AZURE_SPEECH_PHRASES`는 선택 값입니다. Azure Speech가 자주 틀리는 고유명사, 브랜드명, 서비스명, 프로젝트명을 쉼표로 구분해 입력합니다. 예를 들어 `메타,인스타그램,핫라인`처럼 입력하면 음성 인식 중 등록한 값과 비슷한 발음이 들렸을 때 Azure Speech에 참고할 힌트로 전달됩니다. 비워두면 이 힌트를 전달하지 않습니다.

이 값은 등록한 표현을 정답으로 강제하지 않습니다. 회의와 관련 없는 단어를 많이 넣으면 비슷한 발음을 해석할 때 잘못된 결과가 나올 수 있습니다. 소음, 마이크 품질, 여러 사람이 동시에 말하는 상황, 빠른 말 때문에 생기는 문제는 이 값만으로 해결되지 않습니다. 이 값에는 회사명이나 프로젝트명이 들어갈 수 있으므로 `NEXT_PUBLIC_` prefix를 붙이지 않습니다.

#### Google AI Studio

[Google AI Studio API Key 페이지](https://aistudio.google.com/app/apikey)에서 API key를 생성합니다. 생성한 key는 `.env.local`의 `GEMINI_API_KEY`에 입력합니다.

API key 생성 및 관리 방식은 [Google AI for Developers 문서](https://ai.google.dev/gemini-api/docs/api-key)를 참고할 수 있습니다.

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 환경 변수                   | 설명                                  |
| --------------------------- | ------------------------------------- |
| `DATABASE_URL`              | Neon PostgreSQL connection string     |
| `AZURE_SPEECH_SECRET_KEY`   | Azure Speech 리소스 key               |
| `AZURE_SPEECH_REGION`       | Azure Speech 리소스 region identifier |
| `AZURE_SPEECH_PHRASES`      | Azure Speech phrase list에 등록할 선택 단어 및 구문 |
| `GEMINI_API_KEY`            | Google AI Studio에서 발급한 API key   |
| `AUTH_LOGIN_ID`             | Minutly 로그인에 사용할 아이디        |
| `AUTH_PASSWORD`             | Minutly 로그인에 사용할 비밀번호      |
| `AUTH_ACCESS_TOKEN_SECRET`  | access token 서명에 사용할 secret     |
| `AUTH_REFRESH_TOKEN_SECRET` | refresh token 서명에 사용할 secret    |

`AUTH_ACCESS_TOKEN_SECRET`, `AUTH_REFRESH_TOKEN_SECRET`에는 서로 다른 임의 문자열을 입력합니다. 아래 명령을 두 번 실행해 각각 다른 값을 만들 수 있습니다.

```bash
openssl rand -base64 32
```

### 3. 데이터베이스 스키마 생성

Neon SQL Editor 또는 사용 중인 PostgreSQL 클라이언트에서 [db/schema.sql](./db/schema.sql)을 실행합니다.

이 스키마는 회의록을 저장하는 `meetings` 테이블과 회의별 개인 메모를 저장하는 `meeting_memos` 테이블을 생성합니다. 회의가 삭제되면 해당 회의에 연결된 개인 메모도 함께 삭제됩니다.

### 4. 로컬 실행

개발 서버를 실행합니다.

```bash
pnpm dev
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:3000
```

로컬에서 다음 기능이 동작하는지 확인합니다.

- `.env.local`에 설정한 아이디와 비밀번호로 로그인
- 마이크 권한 허용
- 녹음 시작 및 실시간 전사
- 전사 내용 확인 및 수정
- AI 요약 생성
- 회의록 저장
- 기록 화면에서 저장된 회의록 조회

## 배포

Minutly는 배포해 개인용 웹 서비스처럼 사용할 수 있습니다. Minutly는 Next.js 어플리케이션이므로 Vercel, Netlify, Render, AWS, OCI 등 Next.js 또는 Node.js 어플리케이션을 실행할 수 있는 환경에 배포할 수 있습니다.

현재 이 프로젝트는 Vercel에 배포된 상태입니다. 다른 플랫폼에 배포할 경우에도 `.env.local`에 설정한 모든 값을 해당 플랫폼의 Environment Variables 또는 Secrets 설정에 동일하게 등록해야 합니다.

환경 변수에는 외부 API Key, DB 연결 정보, 로그인 정보, JWT 서명 secret이 포함되어 있으므로 브라우저에 노출되면 안 됩니다. Next.js에서 클라이언트에 노출되는 `NEXT_PUBLIC_` prefix를 붙이지 말고 서버 환경 변수로만 등록합니다.

또한 Vercel WAF Rate Limiting을 사용할 수 있다면 로그인 API인 `/api/auth/login`에 rate limit rule을 우선 적용하는 것을 권장합니다. Hobby 플랜은 프로젝트당 사용할 수 있는 rate limit rule 수가 제한되어 있으므로 로그인 시도 제한을 가장 먼저 보호하는 편이 적합합니다.

다른 호스팅 플랫폼에 배포할 경우에도 다음 항목을 확인해야 합니다.

- 환경 변수가 빌드 로그나 클라이언트 번들에 노출되지 않는지
- HTTPS 환경에서 서비스되는지(마이크 입력은 브라우저 권한과 HTTPS 환경이 필요합니다.)
- 서버 API Route가 정상적으로 실행되는지
- 배포 전에 Neon 데이터베이스에 `db/schema.sql`이 적용되어 있는지
- 로그인, 녹음, 요약 생성, 회의록 저장, 기록 조회가 배포 환경에서 동작하는지

## 사용 범위와 한계

Minutly는 다중 사용자를 위한 SaaS가 아니라 1인 또는 지정된 소수 사용자를 위한 self-hosted 앱입니다.

- 회원가입, 팀 초대, 조직 권한 관리 기능은 제공하지 않습니다.
- 서비스 접근은 환경 변수에 등록한 단일 아이디와 비밀번호로 제한합니다.
- 오디오 원본은 저장하지 않습니다.
- 회의 전사, 요약, 주요 사항, 개인 메모는 Neon PostgreSQL에 저장됩니다.
- 외부 서비스의 무료 사용량과 과금 정책은 각 서비스 정책에 따라 달라질 수 있습니다.

## 외부 서비스 교체

Minutly는 기본적으로 Google AI Studio로 회의 요약을 생성하고 Neon PostgreSQL에 회의록을 저장합니다.

다만 프로젝트를 직접 수정할 수 있다면 이 두 서비스는 다른 서비스로 바꿔 사용할 수 있습니다. 예를 들어 회의록 저장소를 다른 데이터베이스로 바꾸거나 요약 생성을 OpenAI나 Groq 같은 다른 LLM API로 바꿀 수 있습니다.

아래 내용은 코드를 수정해 외부 서비스를 교체하려는 사용자를 위한 안내입니다.

### 데이터베이스 변경

다른 Neon 프로젝트를 사용할 경우 `.env.local`의 `DATABASE_URL`만 변경하면 됩니다.

Supabase, Railway, AWS RDS처럼 Neon이 아닌 데이터베이스에 회의록을 저장하고 싶다면 코드 수정이 필요합니다. 새 저장소 코드는 [src/entities/meeting/server/meeting-db.ts](src/entities/meeting/server/meeting-db.ts)의 `MeetingDbAdapter` interface와 동일한 기능을 제공해야 합니다.

- 기본 구현체는 [src/entities/meeting/server/neon-meeting-db.ts](src/entities/meeting/server/neon-meeting-db.ts)의 `NeonMeetingDb`입니다.

새 구현체를 만든 뒤 `getMeetingDb()`에서 사용하는 의존성을 변경합니다.

```ts
export function getMeetingDb(): MeetingDbAdapter {
  return new MeetingDb(new YourMeetingDb());
}
```

새 어댑터는 다음 동작을 기존 구현과 동일하게 보장해야 합니다.

- 회의 생성 시 `now = new Date()`처럼 현재 시각을 한 번만 만들고, 같은 `now`로 `createdAt`, `updatedAt`, `meetingDate`를 계산합니다. 기존 구현은 `meetingDate`를 `toMeetingDate(now)`로 생성합니다.
- `meetingDate`는 서버/DB의 UTC 날짜가 아니라 사용하는 지역 기준 날짜여야 합니다.
- 월별 날짜 조회는 예를 들어 2026년 6월이면 `2026-06-01 <= meetingDate < 2026-07-01` 범위로 조회합니다.
- 특정 날짜의 회의 목록은 생성 시각을 기준으로 오름차순으로 반환합니다.
- 회의 상세 조회 응답은 `createdAt`, `updatedAt`을 ISO timestamp 문자열로 반환합니다.
- 회의 수정 시 `title`, `summary`, `keyPoints`, `updatedAt`만 변경하고 원문 전사와 최종 전사는 유지합니다.
- 회의 삭제 시 연결된 개인 메모도 함께 삭제합니다.
- 개인 메모 목록은 ID를 기준으로 오름차순으로 반환합니다.
- 개인 메모는 회의 1건당 최대 50개까지만 생성할 수 있어야 합니다.
- 개인 메모 생성과 삭제는 동시 요청에서도 잘못된 개수 초과나 불일치가 생기지 않도록 트랜잭션 또는 락 등으로 보호합니다.
- 존재하지 않는 회의나 메모에 대해 `MeetingDbAdapter`의 result type과 동일한 실패 사유를 반환합니다.

날짜 계산 규칙의 자세한 배경은 [docs/db.md](./docs/db.md)의 `meeting_date 생성 규칙`을 참고할 수 있습니다.

### AI Summary 변경

Google AI Studio 대신 OpenAI, Groq 등 다른 LLM 서비스를 사용하려면 AI 요약 어댑터를 새로 만들면 됩니다.

AI 요약 어댑터는 [src/entities/summary/server/summary-service.ts](src/entities/summary/server/summary-service.ts)의 `SummaryProviderAdapter` interface를 구현해야 합니다. 기본 구현체는 [src/entities/summary/server/gemini-summary-provider.ts](src/entities/summary/server/gemini-summary-provider.ts)의 `GeminiSummaryProvider`입니다.

새 구현체를 만든 뒤 `getSummaryService()`에서 사용하는 의존성을 변경합니다.

```ts
export function getSummaryService(): SummaryProviderAdapter {
  return new SummaryService(new YourSummaryProvider());
}
```

새 AI 요약 어댑터는 다음 동작을 기존 구현과 동일하게 보장해야 합니다.

- 입력값으로 회의 제목 `title`과 최종 전사 텍스트 `transcript`를 받습니다.
- 성공 시 `summary` 문자열과 `keyPoints` 문자열 배열을 반환합니다.
- 실패 시 예외를 그대로 노출하지 않고 `{ok: false}` 형태로 반환합니다.
- 요약 결과는 제공된 회의 제목과 전사 텍스트만 근거로 생성해야 합니다.
- `keyPoints`는 화면에서 바로 표시할 수 있는 독립적인 문장 목록이어야 합니다.
- LLM 응답 형식이 일정하지 않은 경우 어댑터 내부에서 파싱과 검증을 끝낸 뒤 `SummaryProviderAdapter`의 반환 형식에 맞춰 반환합니다.

필요한 경우 새 LLM 서비스에 맞는 API Key를 환경 변수에 추가하고 `.env.example`과 README의 환경 변수 설명도 함께 수정합니다.

## 기능 확장 시 참고 사항

새 API나 기능을 추가할 경우 서버 에러 응답과 사용자 안내 문구를 함께 추가해야 합니다.

- 서버 에러 메시지는 [src/shared/config/errorMessage.ts](src/shared/config/errorMessage.ts)에 등록합니다.
- React Query 요청 에러는 [src/app/providers/ReactQueryProvider.tsx](src/app/providers/ReactQueryProvider.tsx)에서 전역 에러 상태로 전달됩니다.
- 전역 에러는 [src/app/providers/GlobalErrorDetector.tsx](src/app/providers/GlobalErrorDetector.tsx)에서 toast 또는 최상위 error boundary로 처리됩니다.

## 개발 문서

프로젝트 관련 산출 문서는 아래에서 확인할 수 있습니다.

- [PRD](./docs/prd.md)
- [기능 명세](./docs/functional_specification.md)
- [API 명세](./docs/api_specification.md)
- [DB 설계](./docs/db.md)
- [개발 계획](./docs/plan.md)

## 라이센스

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다.
