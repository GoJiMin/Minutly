import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';

export default function MeetingHistoryWorkspace() {
  return (
    <section>
      <MeetingHistorySidebar />
      <MeetingHistoryDetailPanel />
    </section>
  );
}
