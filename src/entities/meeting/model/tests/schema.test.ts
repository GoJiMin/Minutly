import {meetingDatesQuerySchema, meetingsByDateQuerySchema} from '../schema';

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

    it('윤년의 2월 29일은 검증에 성공한다.', () => {
      const result = meetingsByDateQuerySchema.safeParse({date: '2024-02-29'});

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
});
