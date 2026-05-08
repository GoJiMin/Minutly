import z from 'zod';

export const createSummaryRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '회의 제목을 입력해주세요.')
    .max(100, '회의 제목은 최대 100자 이하로 입력할 수 있습니다.'),
  originTranscript: z.string().trim().min(1, '요약할 회의 내용이 충분하지 않습니다.'),
  transcript: z.string().trim().min(300, '요약할 회의 내용이 충분하지 않습니다.'),
});

export type CreateSummaryRequest = z.infer<typeof createSummaryRequestSchema>;
