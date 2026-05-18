import {NextResponse} from 'next/server';
// import {NextRequest, NextResponse} from 'next/server';
// import type {ZodError} from 'zod';
import type {CreateSummaryResponse} from '@/entities/summary/server';
// import {createSummaryRequestSchema, GeminiSummaryProvider, SummaryService} from '@/entities/summary/server';
// import {requireAuth} from '@/shared/server/auth';
// import {createErrorJsonResponse, validateRequestBody} from '@/shared/server';
// import type {ErrorResponse} from '@/shared/api';

// function createSummaryValidationError(error: ZodError): ErrorResponse {
//   const [firstIssue] = error.issues;
//   const [issuePath] = firstIssue?.path ?? [];

//   switch (issuePath) {
//     case 'title':
//       if (firstIssue?.code === 'too_big') {
//         return {
//           title: 'TITLE_TOO_LONG',
//           detail: '회의 제목은 최대 100자 이하로 입력해주세요.',
//           status: 400,
//         };
//       }

//       return {
//         title: 'TITLE_REQUIRED',
//         detail: '회의 제목을 입력해주세요.',
//         status: 400,
//       };
//     case 'transcript':
//       return {
//         title: 'TRANSCRIPT_TOO_SHORT',
//         detail: '요약할 회의 내용이 충분하지 않습니다.',
//         status: 400,
//       };
//     default:
//       return {
//         title: 'INVALID_SUMMARY_REQUEST',
//         detail: '요약 요청이 올바르지 않습니다. 다시 확인해주세요.',
//         status: 400,
//       };
//   }
// }

export async function POST(): Promise<NextResponse<CreateSummaryResponse>> {
  await new Promise(resolve => setTimeout(resolve, 3000));

  return NextResponse.json(
    {
      summary:
        '이번 회의에서는 Minutly의 전사 검토 화면에서 요약 생성 결과를 어떤 방식으로 보여줄지 논의했습니다. 전사 편집 화면은 사용자가 오타와 누락 내용을 수정하는 주 작업 영역으로 유지하고, 생성된 요약은 별도의 다이얼로그에서 확인하는 방향이 적절하다고 정리했습니다. 특히 전사 검토 화면 자체는 사용자가 텍스트를 계속 수정하고 다시 요약을 요청할 수 있는 안정적인 작업 공간이어야 하므로, 요약 생성 중이나 요약 실패 시에 화면 전체를 다른 상태로 전환하는 방식은 피하는 것이 좋다고 판단했습니다.\n\n요약 생성 요청 전에는 사용자가 입력한 제목과 수정한 전사 내용을 localStorage draft로 저장해, 요약 실패나 전체 화면 오류가 발생하더라도 편집 내용을 복구할 수 있도록 합니다. 원본 전사는 기존 녹음 draft에서 복구 가능한 값으로 보고, review draft에는 중복 저장하지 않는 방향을 유지합니다. 이 방식은 localStorage에 같은 대용량 원본 전사를 여러 번 저장하지 않으면서도, 사용자가 실제로 수정한 값인 title과 transcript를 안정적으로 되살릴 수 있다는 장점이 있습니다.\n\n검토 단계에서 중단 구간 확인 상태를 영구 복구할지에 대해서도 논의했습니다. 결론적으로 중단 구간 확인은 저장해야 할 영속 데이터가 아니라 현재 검토 세션 안에서 사용자가 알림을 접는 UI 상태에 가깝다고 보았습니다. 사용자가 확인 버튼만 눌러놓고 실제로 누락된 내용을 채우지 않았을 수 있으므로, 새로고침 후에는 중단 구간 알림이 다시 나타나는 편이 더 안전하다고 정리했습니다. 이는 사용자가 회의 내용의 잠재적 누락 지점을 다시 확인하도록 유도하는 보수적인 흐름입니다.\n\n요약 API 요청에서는 실제 요약 생성에 필요한 title과 transcript만 전달하고, originTranscript는 최종 회의 저장 요청에서만 사용하는 것으로 책임을 분리했습니다. 서버의 요약 provider도 최종 transcript만 기반으로 요약을 생성하고 있으므로, originTranscript를 summary API에 포함시키는 것은 불필요한 요청 데이터였습니다. 대신 회의 저장 단계에서는 원본 전사와 수정된 전사를 모두 보존해야 하므로, 그때 originTranscript를 포함한 CreateMeetingRequest를 조립하는 방향이 더 명확합니다.\n\n요약 생성 실패 처리는 컴포넌트 내부 try-catch가 아니라 기존 React Query 전역 mutation error 흐름을 그대로 활용하기로 했습니다. MutationCache에서 RequestError를 전역 에러 store로 전달하고, GlobalErrorDetector가 이를 토스트로 표시하는 구조가 이미 있기 때문입니다. 따라서 summary mutation은 실패를 로컬에서 삼키지 않고, 성공 시에만 다이얼로그에 표시할 요약 결과 상태를 갱신하는 방식으로 유지하는 것이 앱 전체 패턴과 더 잘 맞습니다.\n\n요약 결과 다이얼로그는 단순 확인창이 아니라 저장 전 검토 표면으로 설계하는 것이 적절합니다. 다이얼로그 안에는 총 회의 요약과 주요 사항을 충분히 읽을 수 있는 스크롤 영역이 필요하고, 하단 액션은 저장, 다시 요약, 수정하기처럼 명확하게 분리되어야 합니다. 요약 문장이 길어지거나 주요 사항이 많아져도 footer 액션이 화면 밖으로 밀리지 않도록, 본문 영역만 스크롤되고 액션 영역은 고정되는 레이아웃을 우선 고려해야 합니다.\n\n최종적으로 이 흐름은 전사 편집, 요약 생성, 요약 검토, 회의 저장을 각각 다른 책임으로 분리합니다. 사용자는 전사를 고친 뒤 요약 생성을 요청하고, 생성된 결과를 다이얼로그에서 확인한 뒤 저장 여부를 결정할 수 있습니다. 실패가 발생해도 편집 화면은 유지되고, draft snapshot으로 복구 가능한 상태가 남아 있으므로 Phase 6의 입력 유지 요구사항을 만족합니다.',
      keyPoints: [
        '전사 검토 화면은 계속 편집 중심 화면으로 유지한다.',
        '요약 결과는 인라인 패널보다 다이얼로그로 표시하는 방향이 적절하다.',
        '요약 요청 전 title과 transcript를 review draft로 저장한다.',
        'originTranscript는 요약 API 요청에서 제외하고 회의 저장 요청에서만 사용한다.',
        '요약 실패는 전역 mutation error 처리 흐름을 통해 토스트로 안내한다.',
      ],
    },
    {status: 200},
  );

  // const requireAuthResult = await requireAuth();

  // if (!requireAuthResult.ok) {
  //   return requireAuthResult.error;
  // }

  // const validateResult = await validateRequestBody(req, createSummaryRequestSchema, createSummaryValidationError);

  // if (!validateResult.ok) {
  //   return validateResult.error;
  // }

  // const summaryService = new SummaryService(new GeminiSummaryProvider());
  // const result = await summaryService.createSummary(validateResult.value);

  // if (!result.ok) {
  //   return createErrorJsonResponse({
  //     title: 'SUMMARY_FAILED',
  //     detail: '요약 생성에 실패했습니다.',
  //     status: 500,
  //   });
  // }

  // return NextResponse.json(result.value, {status: 200});
}
