'use client';

import {CalendarDays} from 'lucide-react';
import {SelectedDateMeetingList} from './SelectedDateMeetingList';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {Text} from '@/shared/components';

export function MeetingListBySelectedDate() {
  const {date} = useMeetingHistorySearchParams();

  if (!date) {
    return <SelectDateEmptyState />;
  }

  return (
    <div className="min-h-0 w-full flex-1 flex flex-col items-center px-1">
      <SelectedDateMeetingList date={date} />
    </div>
  );
}

function SelectDateEmptyState() {
  return (
    <div className="flex min-h-48 w-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarDays aria-hidden className="size-7" />
      </div>

      <div className="space-y-1.5">
        <Text className="font-medium">날짜를 선택해주세요</Text>
        <Text variant="muted" className="text-sm">
          캘린더에서 날짜를 선택하면 회의 목록이 표시됩니다.
        </Text>
      </div>
    </div>
  );
}
