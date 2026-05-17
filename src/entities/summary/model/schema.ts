import z from 'zod';

export const createSummaryRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '회의 제목을 입력해주세요.')
    .max(100, '회의 제목은 최대 100자 이하로 입력할 수 있습니다.'),
  transcript: z.string().trim().min(300, '요약할 회의 내용이 충분하지 않습니다.'),
});

export const summaryGenerationResultSchema = z.object({
  summaryParagraphs: z
    .array(z.string().trim().min(1, 'AI 요약 응답의 요약 단락 형식이 올바르지 않습니다.'))
    .min(1, 'AI 요약 응답에 요약 단락이 없습니다.')
    .max(12, 'AI 요약 응답의 요약 단락이 너무 많습니다.'),
  keyPoints: z
    .array(z.string().trim().min(1, 'AI 요약 응답의 주요 사항 형식이 올바르지 않습니다.'))
    .min(1, 'AI 요약 응답에 주요 사항이 없습니다.')
    .max(20, 'AI 요약 응답의 주요 사항이 너무 많습니다.'),
});

export type CreateSummaryRequest = z.infer<typeof createSummaryRequestSchema>;
export type CreateSummaryResponse = {
  summary: string;
  keyPoints: string[];
};
