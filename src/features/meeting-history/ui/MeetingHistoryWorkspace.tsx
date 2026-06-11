import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';
import {MeetingCalenderDrawer} from './MeetingCalenderDrawer';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden py-7 pl-1 pr-4">
      <MeetingHistorySidebar className="hidden md:flex" />
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="fixed md:hidden bottom-4 right-4">
        <MeetingCalenderDrawer />
      </div>
      <MeetingHistoryDetailPanel />
    </section>
  );
}
