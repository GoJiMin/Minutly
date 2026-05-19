import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full flex gap-5 p-10">
      <MeetingHistorySidebar />
      <Separator orientation="vertical" />
      <MeetingHistoryDetailPanel />
    </section>
  );
}
