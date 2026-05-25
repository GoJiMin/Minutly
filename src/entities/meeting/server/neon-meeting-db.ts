import 'server-only';

import {neon} from '@neondatabase/serverless';
import type {CreateMeetingMemoResult, DeleteMeetingMemoResult, MeetingDbAdapter} from './meeting-db';
import type {CreateMeetingRequest, UpdateMeetingRequest} from '../model/schema';
import type {CreateMeetingResponse, MeetingDetail, MeetingListItem, MeetingMemo} from '../model/types';
import {neonConfig} from '@/shared/server';
import {getMonthStartDate, getNextMonthStartDate, toMeetingDate} from '@/shared/utils';

const MAX_MEETING_MEMO_COUNT = 50;

type NeonMeetingDbOptions = {
  getNow?: () => Date;
};

type MeetingDetailRow = {
  id: string;
  title: string;
  meeting_date: string;
  created_at: Date;
  updated_at: Date;
  origin_transcript: string;
  transcript: string;
  summary: string;
  key_points: string[];
};

type TimestampValue = Date | string;

function toIsoTimestamp(value: TimestampValue) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class NeonMeetingDb implements MeetingDbAdapter {
  private readonly sql = neon(neonConfig.databaseUrl);
  private readonly getNow: () => Date;

  constructor(options: NeonMeetingDbOptions = {}) {
    this.getNow = options.getNow ?? (() => new Date());
  }

  async createMeeting(input: CreateMeetingRequest): Promise<CreateMeetingResponse> {
    const now = this.getNow();
    const {keyPoints, originTranscript, summary, title, transcript} = input;

    const rows = await this.sql`
      INSERT INTO meetings (
        title,
        meeting_date,
        created_at,
        updated_at,
        origin_transcript,
        transcript,
        summary,
        key_points
      ) VALUES (
        ${title},
        ${toMeetingDate(now)},
        ${now},
        ${now},
        ${originTranscript},
        ${transcript},
        ${summary},
        ${JSON.stringify(keyPoints)}::jsonb
      ) RETURNING id, meeting_date::text AS meeting_date;
    `;

    const row = rows[0];

    if (!row) {
      throw new Error('회의 저장 후 생성된 결과를 반환받지 못했습니다.');
    }

    return {
      id: row.id,
      meetingDate: row.meeting_date,
    };
  }

  async getMeetingById(id: string): Promise<MeetingDetail | null> {
    const rows = await this.sql`
      SELECT
        id,
        title,
        meeting_date::text AS meeting_date,
        created_at,
        updated_at,
        origin_transcript,
        transcript,
        summary,
        key_points
      FROM meetings
      WHERE id = ${id};
    `;

    const row = rows[0] as MeetingDetailRow | undefined;

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      meetingDate: row.meeting_date,
      createdAt: toIsoTimestamp(row.created_at),
      updatedAt: toIsoTimestamp(row.updated_at),
      originTranscript: row.origin_transcript,
      transcript: row.transcript,
      summary: row.summary,
      keyPoints: row.key_points,
    };
  }

  async updateMeeting(id: string, input: UpdateMeetingRequest): Promise<{updated: boolean}> {
    const now = this.getNow();
    const {title, summary, keyPoints} = input;

    const rows = await this.sql`
      UPDATE meetings
      SET
        title = ${title},
        summary = ${summary},
        key_points = ${JSON.stringify(keyPoints)}::jsonb,
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING id;
    `;

    return {updated: rows.length > 0};
  }

  async deleteMeeting(id: string): Promise<{deleted: boolean}> {
    const rows = await this.sql`
      DELETE FROM meetings
      WHERE id = ${id}
      RETURNING id;
    `;

    return {deleted: rows.length > 0};
  }

  async listMeetingDates(year: string, month: string): Promise<string[]> {
    const currentMonthStartDate = getMonthStartDate(year, month);
    const nextMonthStartDate = getNextMonthStartDate(year, month);

    const rows = await this.sql`
      SELECT DISTINCT
        meeting_date::text AS meeting_date
      FROM
        meetings
      WHERE meeting_date >= ${currentMonthStartDate}
        AND meeting_date < ${nextMonthStartDate}
      ORDER BY meeting_date ASC;
    `;

    return rows.map(row => row.meeting_date);
  }

  async listMeetingsByDate(meetingDate: string): Promise<MeetingListItem[]> {
    const rows = await this.sql`
      SELECT
        id,
        title
      FROM
        meetings
      WHERE
        meeting_date = ${meetingDate}
      ORDER BY created_at ASC;
    `;

    return rows.map(row => ({
      id: row.id,
      title: row.title,
    }));
  }

  async listMeetingMemos(meetingId: string): Promise<MeetingMemo[] | null> {
    const [meetingRows, memoRows] = await this.sql.transaction(txn => [
      txn`
        SELECT id
        FROM meetings
        WHERE id = ${meetingId};
      `,
      txn`
        SELECT
          id,
          content
        FROM meeting_memos
        WHERE meeting_id = ${meetingId}
        ORDER BY id ASC;
      `,
    ]);

    if (meetingRows.length === 0) return null;

    return memoRows.map(row => ({
      id: row.id,
      content: row.content,
    }));
  }

  async createMeetingMemo(meetingId: string, content: string): Promise<CreateMeetingMemoResult> {
    const [meetingRows, insertedRows] = await this.sql.transaction(txn => [
      txn`
        SELECT id
        FROM meetings
        WHERE id = ${meetingId}
        FOR UPDATE;
      `,
      txn`
        INSERT INTO meeting_memos (
          meeting_id,
          content
        )
        SELECT
          ${meetingId},
          ${content}
        FROM meetings
        WHERE id = ${meetingId}
          AND (
            SELECT count(*)
            FROM meeting_memos
            WHERE meeting_id = ${meetingId}
          ) < ${MAX_MEETING_MEMO_COUNT}
        RETURNING id;
      `,
    ]);

    if (meetingRows.length === 0) {
      return {created: false, reason: 'MEETING_NOT_FOUND'};
    }

    if (insertedRows.length === 0) {
      return {created: false, reason: 'MEETING_MEMOS_TOO_MANY'};
    }

    return {created: true};
  }

  async deleteMeetingMemo(meetingId: string, memoId: number): Promise<DeleteMeetingMemoResult> {
    const [meetingRows, deletedRows] = await this.sql.transaction(txn => [
      txn`
        SELECT id
        FROM meetings
        WHERE id = ${meetingId}
        FOR UPDATE;
      `,
      txn`
        DELETE FROM meeting_memos
        WHERE meeting_id = ${meetingId}
          AND id = ${memoId}
        RETURNING id;
      `,
    ]);

    if (meetingRows.length === 0) {
      return {deleted: false, reason: 'MEETING_NOT_FOUND'};
    }

    if (deletedRows.length === 0) {
      return {deleted: false, reason: 'MEETING_MEMO_NOT_FOUND'};
    }

    return {deleted: true};
  }
}
