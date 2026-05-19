import {Suspense} from 'react';
import {MeetingCalendar} from './MeetingCalendar';
import {MeetingListBySelectedDate} from './MeetingListBySelectDate';
import {Separator} from '@/shared/components';

export function MeetingHistorySidebar() {
  return (
    <aside className="w-96 h-full min-h-0 flex flex-col items-center gap-3">
      {/* TODO: 로딩 UI 및 에러 바운더리 폴백 UI 구현 */}
      <Suspense fallback={<div>loading</div>}>
        <MeetingCalendar />
      </Suspense>
      <Separator />
      {/* TODO: 로딩 UI 및 에러 바운더리 폴백 UI 구현 */}
      <Suspense fallback={<div>loading</div>}>
        <MeetingListBySelectedDate />
      </Suspense>
    </aside>
  );
}
