import {Suspense} from 'react';
import {MeetingCalendar} from './MeetingCalendar';

export function MeetingHistorySidebar() {
  return (
    <aside className="w-96 flex flex-col items-center">
      {/* TODO: 로딩 UI 및 에러 바운더리 폴백 UI 구현 */}
      <Suspense fallback={<div>loading</div>}>
        <MeetingCalendar />
      </Suspense>
    </aside>
  );
}
