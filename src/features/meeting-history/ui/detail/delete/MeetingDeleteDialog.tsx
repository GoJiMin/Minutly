import {useState} from 'react';
import {Trash2} from 'lucide-react';
import {useDeleteMeetingMutation} from '@/entities/meeting/client';
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
  toast,
} from '@/shared/components';

type Props = {
  meetingId: string;
  meetingDate: string;
};

export function MeetingDeleteDialog({meetingId, meetingDate}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const {deleteMeeting, isDeletingMeeting} = useDeleteMeetingMutation();

  function handleDeleteMeeting() {
    deleteMeeting(
      {
        id: meetingId,
        meetingDate,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          toast.success({
            title: '회의록 삭제 완료',
            description: '회의록이 성공적으로 삭제 됐어요.',
          });
        },
      },
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (isDeletingMeeting) return;
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-5 font-semibold">
          <Trash2 />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isDeletingMeeting} className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">회의록 삭제</DialogTitle>
          <DialogDescription>삭제한 회의록은 다시 되돌릴 수 없어요.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isDeletingMeeting}
              className="h-10 w-full shrink rounded-lg gap-2 font-semibold"
            >
              닫기
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isDeletingMeeting}
            onClick={handleDeleteMeeting}
            className="h-10 w-full shrink rounded-lg gap-2 font-semibold"
          >
            {isDeletingMeeting ? (
              <>
                <Spinner />
                삭제 중
              </>
            ) : (
              <>
                <Trash2 className="size-5" />
                삭제하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
