import {MeetingCalendar} from './MeetingCalendar';

export function MeetingHistorySidebar() {
  return (
    <aside className="w-96 flex flex-col">
      <MeetingCalendar />
    </aside>
  );
}
