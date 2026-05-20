import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from '@/shared/components';
import {MeetingEditForm, type MeetingEditFormProps} from './MeetingEditForm';
import {PencilLine, Save} from 'lucide-react';
import {useUpdateMeetingMutation} from '@/entities/meeting/client';

export function MeetingEditDialog(props: MeetingEditFormProps) {
  const {updateMeeting, isUpdatingMeeting} = useUpdateMeetingMutation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-5 font-semibold">
          <PencilLine className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[min(calc(100vh-32px),900px)] flex flex-col rounded-xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-muted/60 px-6 py-5">
          <DialogTitle className="text-2xl font-bold">회의록 수정</DialogTitle>
          <DialogDescription>수정 후 저장하기 버튼을 눌러주세요.</DialogDescription>
        </DialogHeader>
        <MeetingEditForm {...props} />
        <DialogFooter className="border-t border-border bg-muted/60 px-7 py-5">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isUpdatingMeeting}
              className="h-11 min-w-44 rounded-lg gap-2 px-7 text-base font-semibold"
            >
              닫기
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isUpdatingMeeting}
            className="h-11 min-w-44 rounded-lg gap-2 px-7 text-base font-semibold"
          >
            {isUpdatingMeeting ? (
              <>
                <Spinner />
                저장 중
              </>
            ) : (
              <>
                <Save className="size-5" />
                저장하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
