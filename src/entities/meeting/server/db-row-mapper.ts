import {MeetingDetail, MeetingListItem} from '../model/types';

export type MeetingDetailRow = {
  id: string;
  title: string;
  meeting_date: string;
  created_at: string;
  updated_at: string;
  origin_transcript: string;
  transcript: string;
  summary: string;
  key_points: string[];
};

export type MeetingListItemRow = {
  id: string;
  title: string;
  meeting_date: string;
  created_at: string;
  updated_at: string;
};

export function mapMeetingDetailRow(row: MeetingDetailRow): MeetingDetail {
  return {
    id: row.id,
    title: row.title,
    meetingDate: row.meeting_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    originTranscript: row.origin_transcript,
    transcript: row.transcript,
    summary: row.summary,
    keyPoints: row.key_points,
  };
}

export function mapMeetingListItemRow(row: MeetingListItemRow): MeetingListItem {
  return {
    id: row.id,
    title: row.title,
    meetingDate: row.meeting_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
