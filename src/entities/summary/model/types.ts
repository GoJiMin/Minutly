import z from 'zod';

export const createSummaryResponseSchema = z.object({
  summary: z.string().trim().min(1, '회의 요약을 입력해주세요.'),
  keyPoints: z
    .array(z.string().trim().min(1, '주요 사항을 입력해주세요.'))
    .min(1, '주요 사항을 1개 이상 입력해주세요.')
    .max(20, '주요 사항은 최대 20개까지 생성할 수 있습니다.'),
});

export type CreateSummaryResponse = z.infer<typeof createSummaryResponseSchema>;
