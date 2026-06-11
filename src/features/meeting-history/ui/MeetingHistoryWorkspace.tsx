import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';
import {MeetingCalenderDrawer} from './MeetingCalenderDrawer';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden py-7 pl-1 pr-4">
      <div className="hidden md:block">
        <MeetingHistorySidebar />
        <Separator orientation="vertical" />
      </div>
      <div className="fixed bottom-4 right-4">
        <MeetingCalenderDrawer />
      </div>
      <MeetingHistoryDetailPanel />
    </section>
  );
}
