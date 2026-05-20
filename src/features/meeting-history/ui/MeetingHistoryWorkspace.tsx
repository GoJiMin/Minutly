import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden py-7 pl-1 pr-4">
      <MeetingHistorySidebar />
      <Separator orientation="vertical" />
      <MeetingHistoryDetailPanel />
    </section>
  );
}
