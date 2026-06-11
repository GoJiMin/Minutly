import {Separator} from '@/shared/components';
import {MeetingHistoryDetailPanel} from './detail/MeetingHistoryDetailPanel';
import {MeetingHistorySidebar} from './side-bar/MeetingHistorySidebar';
import {MeetingCalenderDrawer} from './MeetingCalenderDrawer';

export default function MeetingHistoryWorkspace() {
  return (
    <section className="w-full h-full min-h-0 flex overflow-hidden pt-6 pb-3 px-1 md:py-7 md:pl-1 md:pr-4">
      <MeetingHistorySidebar className="hidden md:flex" />
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="fixed bottom-4 right-4 z-20 md:hidden">
        <MeetingCalenderDrawer />
      </div>
      <MeetingHistoryDetailPanel />
    </section>
  );
}
