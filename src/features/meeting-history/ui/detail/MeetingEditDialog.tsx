import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from '@/shared/components';
import {MeetingEditForm, type MeetingEditFormProps} from './MeetingEditForm';
import {PencilLine} from 'lucide-react';

export function MeetingEditDialog(props: MeetingEditFormProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-5 font-semibold">
          <PencilLine className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[min(calc(100vh-32px),900px)] flex flex-col gap-3">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-2xl font-bold">회의록 수정</DialogTitle>
          <DialogDescription>수정할 부분을 작성하고 저장 버튼을 눌러주세요.</DialogDescription>
        </DialogHeader>
        <Separator />
        <MeetingEditForm {...props} />
      </DialogContent>
    </Dialog>
  );
}
