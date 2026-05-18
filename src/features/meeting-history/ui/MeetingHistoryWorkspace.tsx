import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';

type Props = {
  year: string;
  month: string;
  meetingId?: string;
};

export function MeetingHistoryWorkspace({year, month, meetingId}: Props) {
  console.log(year, month, meetingId);

  return (
    <section>
      <MeetingHistorySidebar />
      <MeetingHistoryDetailPanel />
    </section>
  );
}
