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
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 py-4">
      <header className="border-b border-border/70 px-4 pb-3">
        <Text className="font-semibold leading-6">메모</Text>
        <Text variant="muted" className="text-xs leading-5">
          이 회의에만 저장되는 내용이에요.
        </Text>
      </header>
      <MeetingMemoList meetingId={meetingId} memos={memos} />
      <MeetingMemoForm meetingId={meetingId} />
    </div>
  );
}
