import {useMeetingHistoryNavigation} from '../../lib/useMeetingHistoryNavigation';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {useMeetingsByDateQuery} from '@/entities/meeting/client';

export function SelectedDateMeetingList({date}: {date: string}) {
  const {meetingId} = useMeetingHistorySearchParams();
  const {selectMeeting} = useMeetingHistoryNavigation();
  const meetings = useMeetingsByDateQuery({date});

  if (meetings.length === 0) {
    return <div>선택한 날짜에 회의가 없습니다.</div>;
  }

  return (
    <nav>
      {meetings.map(meeting => (
        <button
          key={meeting.id}
          type="button"
          onClick={() => selectMeeting(meeting.id)}
          aria-current={meeting.id === meetingId ? 'true' : undefined}
        >
          {meeting.title}
        </button>
      ))}
    </nav>
  );
}
