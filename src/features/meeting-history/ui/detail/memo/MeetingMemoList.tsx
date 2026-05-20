import {Trash2} from 'lucide-react';
import {MeetingMemo, useDeleteMeetingMemoMutation} from '@/entities/meeting/client';
import {Button, Text} from '@/shared/components';

type Props = {
  memos: MeetingMemo[];
  meetingId: string;
};

export function MeetingMemoList({memos, meetingId}: Props) {
  const {deleteMeetingMemo} = useDeleteMeetingMemoMutation();

  return (
    <ul className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto px-3 py-2">
      {memos.map(memo => (
        <li key={memo.id} className="flex items-end justify-end gap-1.5">
          <div className="max-w-[90%] rounded-2xl rounded-br-sm border border-border/80 bg-background px-3 py-2 text-foreground">
            <Text className="text-sm leading-6 text-current">{memo.content}</Text>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="mb-0.5 text-muted-foreground hover:text-destructive"
            aria-label="메모 삭제"
            onClick={() => deleteMeetingMemo({meetingId, memoId: memo.id})}
          >
            <Trash2 aria-hidden className="size-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
