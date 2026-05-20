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
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-5 font-semibold">
          <PencilLine className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!isUpdatingMeeting}
        className="max-w-7xl h-[min(calc(100vh-32px),900px)] flex flex-col rounded-xl overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-border bg-muted/60 px-6 py-5">
          <DialogTitle className="text-2xl font-bold">회의록 수정</DialogTitle>
          <DialogDescription>수정 후 저장하기 버튼을 눌러주세요.</DialogDescription>
        </DialogHeader>
        <MeetingEditForm {...props} isSaving={isUpdatingMeeting} onSubmit={handleSubmit} />
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
            form="meeting-edit-form"
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
