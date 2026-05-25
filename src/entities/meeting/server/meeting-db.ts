import 'server-only';

import type {CreateMeetingRequest, UpdateMeetingRequest} from '../model/schema';
import type {CreateMeetingResponse, MeetingDetail, MeetingListItem, MeetingMemo} from '../model/types';
import {NeonMeetingDb} from './neon-meeting-db';

export function getMeetingDb(): MeetingDbAdapter {
  return new MeetingDb(new NeonMeetingDb());
}

export type CreateMeetingMemoResult =
  | {created: true}
  | {created: false; reason: 'MEETING_NOT_FOUND' | 'MEETING_MEMOS_TOO_MANY'};

export type DeleteMeetingMemoResult =
  | {deleted: true}
  | {deleted: false; reason: 'MEETING_NOT_FOUND' | 'MEETING_MEMO_NOT_FOUND'};

export interface MeetingDbAdapter {
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

class MeetingDb implements MeetingDbAdapter {
  private readonly adapter: MeetingDbAdapter;

  constructor(adapter: MeetingDbAdapter) {
    this.adapter = adapter;
  }

  createMeeting(input: CreateMeetingRequest) {
    return this.adapter.createMeeting(input);
  }

  getMeetingById(id: string) {
    return this.adapter.getMeetingById(id);
  }

  updateMeeting(id: string, input: UpdateMeetingRequest) {
    return this.adapter.updateMeeting(id, input);
  }

  deleteMeeting(id: string) {
    return this.adapter.deleteMeeting(id);
  }

  listMeetingDates(year: string, month: string) {
    return this.adapter.listMeetingDates(year, month);
  }

  listMeetingsByDate(date: string) {
    return this.adapter.listMeetingsByDate(date);
  }

  listMeetingMemos(meetingId: string) {
    return this.adapter.listMeetingMemos(meetingId);
  }

  createMeetingMemo(meetingId: string, content: string) {
    return this.adapter.createMeetingMemo(meetingId, content);
  }

  deleteMeetingMemo(meetingId: string, memoId: number) {
    return this.adapter.deleteMeetingMemo(meetingId, memoId);
  }
}
