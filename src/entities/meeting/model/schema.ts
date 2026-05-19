import z from 'zod';
import {MEETING_HISTORY_START_DATE, MEETING_HISTORY_START_MONTH} from './constants';

const meetingPayloadSchema = z.object({
  title: z.string().trim().min(1, '회의 제목을 입력해주세요.').max(100, '회의 제목은 100자 이하로 입력해주세요.'),
  originTranscript: z.string().trim().min(1, '회의 원문을 입력해주세요.'),
  transcript: z.string().trim().min(1, '회의 수정본을 입력해주세요.'),
  summary: z.string().trim().min(1, '회의 요약을 입력해주세요.'),
  keyPoints: z
    .array(z.string().trim().min(1, '주요 사항을 입력해주세요.'))
    .min(1, '주요 사항을 1개 이상 입력해주세요.')
    .max(20, '주요 사항은 최대 20개까지 저장할 수 있습니다.'),
});

export const createMeetingRequestSchema = meetingPayloadSchema;
export const updateMeetingRequestSchema = meetingPayloadSchema;

export type CreateMeetingRequest = z.infer<typeof createMeetingRequestSchema>;
export type UpdateMeetingRequest = z.infer<typeof updateMeetingRequestSchema>;

export const meetingIdParamsSchema = z.object({
  id: z.uuid('회의 식별자는 UUID 형식이어야 합니다.'),
});

export const meetingsByDateQuerySchema = z.object({
  date: z.iso
    .date('날짜 형식이 올바르지 않습니다.')
    .refine(value => value >= MEETING_HISTORY_START_DATE, '조회할 수 없는 날짜입니다.'),
});

export const meetingDatesQuerySchema = z
  .object({
    year: z.string().regex(/^\d{4}$/, '조회할 연도 형식이 올바르지 않습니다.'),
    month: z
      .string()
      .regex(/^\d{2}$/, '조회할 월 형식이 올바르지 않습니다.')
      .refine(value => {
        const month = Number(value);
        return month >= 1 && month <= 12;
      }, '조회할 월은 01부터 12까지 입력해주세요.'),
  })
  .refine(({year, month}) => `${year}-${month}` >= MEETING_HISTORY_START_MONTH, '조회할 수 없는 연월입니다.');

export type MeetingIdParams = z.infer<typeof meetingIdParamsSchema>;
export type MeetingsByDateQuery = z.infer<typeof meetingsByDateQuerySchema>;
export type MeetingDatesQuery = z.infer<typeof meetingDatesQuerySchema>;
