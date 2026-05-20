import {MeetingMemoList} from './MeetingMemoList';
import {MeetingMemoForm} from './MeetingMemoForm';
import {useGetMeetingMemos} from '@/entities/meeting/client';
import {Text} from '@/shared/components';

type Props = {
  meetingId: string;
};

export function MeetingMemoPanel({meetingId}: Props) {
  const memos = useGetMeetingMemos(meetingId);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 py-3">
      <header className="px-4 pb-3 pt-1">
        <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-foreground/20" aria-hidden />
        <Text className="font-semibold leading-6">메모</Text>
        <Text variant="muted" className="text-xs leading-5">
          중요한 내용을 등록할 수 있어요.
        </Text>
      </header>
      <MeetingMemoList meetingId={meetingId} memos={memos} />
      <MeetingMemoForm meetingId={meetingId} />
    </div>
  );
}
