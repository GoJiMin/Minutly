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

export type MeetingMemo = {
  id: number;
  content: string;
};

export type GetMeetingsByDateResponse = {
  meetings: MeetingListItem[];
};

export type GetMeetingDatesResponse = {
  dates: string[];
};

export type CreateMeetingResponse = {
  id: string;
  meetingDate: string;
};
