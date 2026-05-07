import {mapMeetingDetailRow, mapMeetingListItemRow, MeetingDetailRow, MeetingListItemRow} from '../db-row-mapper';

describe('@/src/entities/meeting/server/db-row-mapper.ts', () => {
  describe('mapMeetingDetailRow', () => {
    it('DB row의 snake_case 필드를 회의 상세 응답의 camelCase 필드로 변환한다.', () => {
      const row: MeetingDetailRow = {
        id: 'test-id',
        title: 'test-title',
        meeting_date: '2026-05-08',
        created_at: '2026-05-08T10:00:00.000Z',
        updated_at: '2026-05-08T10:30:00.000Z',
        origin_transcript: 'test-origin-transcript',
        transcript: 'test-transcript',
        summary: 'test-summary',
        key_points: ['test-key-point'],
      };

      expect(mapMeetingDetailRow(row)).toEqual({
        id: 'test-id',
        title: 'test-title',
        meetingDate: '2026-05-08',
        createdAt: '2026-05-08T10:00:00.000Z',
        updatedAt: '2026-05-08T10:30:00.000Z',
        originTranscript: 'test-origin-transcript',
        transcript: 'test-transcript',
        summary: 'test-summary',
        keyPoints: ['test-key-point'],
      });
    });
  });

  describe('mapMeetingListItemRow', () => {
    it('DB row의 snake_case 필드를 회의 목록 응답의 camelCase 필드로 변환한다.', () => {
      const row: MeetingListItemRow = {
        id: 'test-id',
        title: 'test-title',
        meeting_date: '2026-05-08',
        created_at: '2026-05-08T10:00:00.000Z',
        updated_at: '2026-05-08T10:30:00.000Z',
      };

      expect(mapMeetingListItemRow(row)).toEqual({
        id: 'test-id',
        title: 'test-title',
        meetingDate: '2026-05-08',
        createdAt: '2026-05-08T10:00:00.000Z',
        updatedAt: '2026-05-08T10:30:00.000Z',
      });
    });
  });
});
