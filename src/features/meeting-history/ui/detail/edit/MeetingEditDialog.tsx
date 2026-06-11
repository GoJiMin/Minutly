import {useState} from 'react';
import {PencilLine, Save} from 'lucide-react';
import {MeetingEditForm, type MeetingEditInitialValues} from './MeetingEditForm';
import {type UpdateMeetingRequest, useUpdateMeetingMutation} from '@/entities/meeting/client';
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

export function MeetingEditDialog(props: MeetingEditInitialValues) {
  const [isOpen, setIsOpen] = useState(false);
  const {updateMeeting, isUpdatingMeeting} = useUpdateMeetingMutation();

  function handleSubmit(payload: UpdateMeetingRequest) {
    updateMeeting(
      {
        id: props.meetingId,
        meetingDate: props.meetingDate,
        payload,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          toast.success({
            title: '회의록 수정 완료',
            description: '변경한 내용이 저장됐어요.',
          });
        },
      },
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (isUpdatingMeeting) return;
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-3 md:px-5 font-semibold">
          <PencilLine className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl h-[min(100vh,900px)] flex flex-col rounded-xl overflow-hidden px-0 pb-4 pt-6 md:p-0 md:pt-2"
      >
        <DialogHeader className="border-b border-border bg-muted/60 px-6 py-5">
          <DialogTitle className="md:text-2xl font-bold">회의록 수정</DialogTitle>
          <DialogDescription>수정 후 저장하기 버튼을 눌러주세요.</DialogDescription>
        </DialogHeader>
        <MeetingEditForm {...props} isSaving={isUpdatingMeeting} onSubmit={handleSubmit} />
        <DialogFooter className="flex-row border-t border-border bg-muted/60 px-3 md:px-7 py-3 md:py-5">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isUpdatingMeeting}
              className="h-10 min-w-0 flex-1 rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-11 md:min-w-44 md:flex-none md:gap-2 md:px-7 md:text-base"
            >
              닫기
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="meeting-edit-form"
            disabled={isUpdatingMeeting}
            className="h-10 min-w-0 flex-1 rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-11 md:min-w-44 md:flex-none md:gap-2 md:px-7 md:text-base"
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
