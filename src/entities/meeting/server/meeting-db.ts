import type {CreateMeetingRequest, UpdateMeetingRequest} from '../model/schema';
import type {CreateMeetingResponse, MeetingDetail, MeetingListItem} from '../model/types';

export interface MeetingDb {
  createMeeting(input: CreateMeetingRequest): Promise<CreateMeetingResponse>;
  getMeetingById(id: string): Promise<MeetingDetail | null>;
  updateMeeting(id: string, input: UpdateMeetingRequest): Promise<void>;
  deleteMeeting(id: string): Promise<void>;
  listMeetingDates(year: string, month: string): Promise<string[]>;
  listMeetingsByDate(date: string): Promise<MeetingListItem[]>;
}
