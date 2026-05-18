import {PencilLine, Save} from 'lucide-react';
import {CreateMeetingRequest} from '@/entities/meeting/client';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
  Spinner,
  Text,
} from '@/shared/components';

type Props = {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onRequestRegenerate: () => void;
  onSave: () => void;
  summaryReview: CreateMeetingRequest;
};

export function SummaryReviewDialog({isOpen, isSaving, onClose, onRequestRegenerate, onSave, summaryReview}: Props) {
  const {title, summary, keyPoints} = summaryReview;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (isSaving) return;
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!isSaving}
        className="flex flex-col max-w-5xl px-8 rounded-2xl h-[min(calc(100vh-32px),850px)]"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>확인이 끝난 후 저장하기 버튼을 클릭해 회의록을 생성할 수 있어요.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-5 overflow-auto pr-6 py-5 border-y">
          <article className="flex flex-col gap-3">
            <Text className="text-xl font-semibold">회의 요약</Text>
            <Text className="whitespace-pre-line">{summary}</Text>
          </article>
          <Separator />
          <article className="flex flex-col gap-3">
            <Text className="text-xl font-semibold">주요 사항</Text>
            <ul className="flex flex-col gap-2">
              {keyPoints.map((keyPoint, index) => (
                <li
                  key={`${index}-${keyPoint.length}`}
                  className="flex gap-3 border-l-2 border-primary/60 bg-muted/30 p-3"
                >
                  <Text className="text-lg">{keyPoint}</Text>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isSaving}
              className="h-11 min-w-44 rounded-lg gap-2 px-7 text-base font-semibold"
            >
              닫기
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onRequestRegenerate}
            className="h-11 min-w-44 rounded-lg gap-2 px-7 text-base font-semibold"
          >
            <PencilLine className="size-5" />
            수정 후 다시 생성하기
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="h-11 min-w-44 rounded-lg gap-2 px-7 text-base font-semibold"
          >
            {isSaving ? (
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
