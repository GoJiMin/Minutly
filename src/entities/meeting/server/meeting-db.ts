import type {CreateMeetingRequest, UpdateMeetingRequest} from '../model/schema';
import type {CreateMeetingResponse, MeetingDetail, MeetingListItem, MeetingMemo} from '../model/types';

export type CreateMeetingMemoResult =
  | {created: true}
  | {created: false; reason: 'MEETING_NOT_FOUND' | 'MEETING_MEMOS_TOO_MANY'};

export type DeleteMeetingMemoResult =
  | {deleted: true}
  | {deleted: false; reason: 'MEETING_NOT_FOUND' | 'MEETING_MEMO_NOT_FOUND'};

export interface MeetingDb {
  createMeeting(input: CreateMeetingRequest): Promise<CreateMeetingResponse>;
  getMeetingById(id: string): Promise<MeetingDetail | null>;
  updateMeeting(id: string, input: UpdateMeetingRequest): Promise<{updated: boolean}>;
  deleteMeeting(id: string): Promise<{deleted: boolean}>;
  listMeetingDates(year: string, month: string): Promise<string[]>;
  listMeetingsByDate(date: string): Promise<MeetingListItem[]>;
  listMeetingMemos(meetingId: string): Promise<MeetingMemo[] | null>;
  createMeetingMemo(meetingId: string, content: string): Promise<CreateMeetingMemoResult>;
  deleteMeetingMemo(meetingId: string, memoId: number): Promise<DeleteMeetingMemoResult>;
}
