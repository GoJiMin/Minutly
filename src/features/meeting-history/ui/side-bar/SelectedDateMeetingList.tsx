import {FileX} from 'lucide-react';
import {useMeetingHistoryNavigation} from '../../lib/useMeetingHistoryNavigation';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';
import {useMeetingsByDateQuery} from '@/entities/meeting/client';
import {Button, Text} from '@/shared/components';
import {cn} from '@/shared/utils';

export function SelectedDateMeetingList({date}: {date: string}) {
  const {meetingId} = useMeetingHistorySearchParams();
  const {selectMeeting} = useMeetingHistoryNavigation();
  const meetings = useMeetingsByDateQuery({date});

  if (meetings.length === 0) {
    return (
      <div className="flex min-h-48 w-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileX aria-hidden className="size-7" />
        </div>

        <div className="space-y-1.5">
          <Text className="font-medium">회의록이 없습니다</Text>
          <Text variant="muted" className="text-sm">
            선택한 날짜에 저장된 회의가 없습니다.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <nav
      aria-label={`${date} 회의 목록`}
      className="w-full min-h-0 flex-1 overflow-y-auto flex flex-col gap-4 py-2 px-2"
    >
      {meetings.map(meeting => {
        const isSelected = meeting.id === meetingId;

        return (
          <Button
            key={meeting.id}
            type="button"
            variant="ghost"
            onClick={() => selectMeeting(meeting.id)}
            aria-current={isSelected ? 'true' : undefined}
            className={cn(
              'relative min-h-14 w-full justify-start overflow-hidden px-4 py-3 text-base font-normal',
              'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:origin-left before:scale-y-0 before:bg-foreground/70 before:transition-transform',
              isSelected
                ? 'bg-muted text-foreground font-semibold before:scale-y-100'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:before:scale-y-100',
            )}
          >
            <span className="min-w-0 truncate">{meeting.title}</span>
          </Button>
        );
      })}
    </nav>
  );
}
