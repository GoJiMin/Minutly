export type MeetingDetail = {
  id: string;
  title: string;
  meetingDate: string;
  createdAt: string;
  updatedAt: string;
  originTranscript: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
};

export type MeetingListItem = {
  id: string;
  title: string;
};

export type GetMeetingsByDateResponse = {
  meetings: MeetingListItem[];
};

export type GetMeetingDatesResponse = {
  year: string;
  month: string;
  dates: string[];
};

export type CreateMeetingResponse = {
  id: string;
  meetingDate: string;
};
