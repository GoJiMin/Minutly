import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full flex py-7 px-1">
      <MeetingHistorySidebar />
      <Separator orientation="vertical" />
      <MeetingHistoryDetailPanel />
    </section>
  );
}
