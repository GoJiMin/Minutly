import {meetingDatesQuerySchema, meetingsByDateQuerySchema, updateMeetingRequestSchema} from '../schema';

describe('@/src/entities/meeting/model/schema.ts', () => {
  describe('meetingsByDateQuerySchema', () => {
    it('정상적인 날짜 형식(YYYY-MM-DD)은 검증에 성공한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026-05-08'});

      expect(result.success).toBe(true);
    });

    it('날짜 형식이 잘못된 경우 검증에 실패한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026.05.08'});

      expect(result.success).toBe(false);
    });

    it('존재하지 않는 날짜는 검증에 실패한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026-99-05'});

      expect(result.success).toBe(false);
    });

    it('조회 가능한 날짜는 검증에 성공한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026-05-08'});

      expect(result.success).toBe(true);
    });

    it('조회 가능 시작일 이전 날짜는 검증에 실패한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026-05-07'});

      expect(result.success).toBe(false);
    });

    it('윤년의 2월 29일은 검증에 성공한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2028-02-29'});

      expect(result.success).toBe(true);
    });

    it('윤년이 아닌 해의 2월 29일은 검증에 실패한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2026-02-29'});

      expect(result.success).toBe(false);
    });
  });

  describe('meetingDatesQuerySchema', () => {
    it('정상적인 연도와 월은 검증에 성공한다.', () => {
      const result = meetingDatesQuerySchema.safeParse({year: '2026', month: '05'});

      expect(result.success).toBe(true);
    });

    it('조회 가능 시작월 이전 연월은 검증에 실패한다.', () => {
      const result = meetingDatesQuerySchema.safeParse({year: '2026', month: '04'});

      expect(result.success).toBe(false);
    });

    it('월 형식이 두자리가 아닌 경우 검증에 실패한다.', () => {
      const result = meetingDatesQuerySchema.safeParse({year: '2026', month: '5'});

      expect(result.success).toBe(false);
    });

    it('비정상적인 월 형식은 검증에 실패한다.', () => {
      const result = meetingDatesQuerySchema.safeParse({year: '2026', month: '13'});

      expect(result.success).toBe(false);
    });

    it('00월은 검증에 실패한다.', () => {
      const result = meetingDatesQuerySchema.safeParse({year: '2026', month: '00'});

      expect(result.success).toBe(false);
    });
  });

  describe('updateMeetingRequestSchema', () => {
    const validPayload = {
      title: '주간 기획 회의',
      summary: '회의 요약입니다.',
      keyPoints: ['담당자를 정합니다.'],
    };

    it('제목, 회의 요약, 주요 사항만 있으면 검증에 성공한다.', () => {
      const result = updateMeetingRequestSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });

    it('originTranscript와 transcript가 없어도 검증에 성공한다.', () => {
      const result = updateMeetingRequestSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
    });

    it('originTranscript와 transcript가 전달되어도 수정 요청 값에는 포함하지 않는다.', () => {
      const result = updateMeetingRequestSchema.safeParse({
        ...validPayload,
        originTranscript: '원본 전사 내용',
        transcript: '최종 회의 내용',
      });

      expect(result.success).toBe(true);

      if (!result.success) {
        throw new Error('Expected update meeting request validation success');
      }

      expect(result.data).toEqual(validPayload);
    });

    it('회의 요약이 비어 있으면 검증에 실패한다.', () => {
      const result = updateMeetingRequestSchema.safeParse({
        ...validPayload,
        summary: '',
      });

      expect(result.success).toBe(false);
    });

    it('주요 사항이 비어 있으면 검증에 실패한다.', () => {
      const result = updateMeetingRequestSchema.safeParse({
        ...validPayload,
        keyPoints: [],
      });

      expect(result.success).toBe(false);
    });

    it('주요 사항이 20개를 초과하면 검증에 실패한다.', () => {
      const result = updateMeetingRequestSchema.safeParse({
        ...validPayload,
        keyPoints: Array.from({length: 21}, (_, index) => `주요 사항 ${index + 1}`),
      });

      expect(result.success).toBe(false);
    });

    it('제목이 100자를 초과하면 검증에 실패한다.', () => {
      const result = updateMeetingRequestSchema.safeParse({
        ...validPayload,
        title: '회'.repeat(101),
      });

      expect(result.success).toBe(false);
    });
  });
});
