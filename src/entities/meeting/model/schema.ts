import z from 'zod';

const meetingPayloadSchema = z.object({
  title: z.string().trim().min(1, '회의 제목을 입력해주세요.').max(100, '회의 제목은 100자 이하로 입력해주세요.'),
  originTranscript: z.string().trim().min(1, '회의 원문을 입력해주세요.'),
  transcript: z.string().trim().min(1, '회의 수정본을 입력해주세요.'),
  summary: z.string().trim().min(1, '회의 요약을 입력해주세요.'),
  keyPoints: z
    .array(z.string().trim().min(1, '주요 사항을 입력해주세요.'))
    .min(1, '주요 사항을 1개 이상 입력해주세요.'),
});

export const createMeetingRequestSchema = meetingPayloadSchema;
export const updateMeetingRequestSchema = meetingPayloadSchema;

export type CreateMeetingRequest = z.infer<typeof createMeetingRequestSchema>;
export type UpdateMeetingRequest = z.infer<typeof updateMeetingRequestSchema>;
