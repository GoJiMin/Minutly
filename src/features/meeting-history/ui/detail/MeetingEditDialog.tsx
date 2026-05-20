import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components';
import {MeetingEditForm} from './MeetingEditForm';
import {PencilLine} from 'lucide-react';

export function MeetingEditDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 rounded-lg gap-1 px-5 font-semibold">
          <PencilLine className="size-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">회의록 수정</DialogTitle>
          <DialogDescription>수정할 부분을 작성하고 저장 버튼을 눌러주세요.</DialogDescription>
        </DialogHeader>
        <MeetingEditForm />
      </DialogContent>
    </Dialog>
  );
}
