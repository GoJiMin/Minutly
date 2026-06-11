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
        showCloseButton={false}
        className="flex flex-col max-w-5xl pt-10 md:pt-8 px-5 md:px-8 gap-4 md:gap-6 rounded-2xl h-[min(100vh,850px)]"
      >
        <DialogHeader>
          <DialogTitle className="md:text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>확인이 끝난 후 저장하기 버튼을 클릭해 회의록을 생성할 수 있어요.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-5 overflow-auto md:pr-6 py-3 md:py-5 border-y">
          <article className="flex flex-col gap-3">
            <Text className="md:text-xl font-semibold">회의 요약</Text>
            <Text className="whitespace-pre-line">{summary}</Text>
          </article>
          <Separator />
          <article className="flex flex-col gap-3">
            <Text className="md:text-xl font-semibold">주요 사항</Text>
            <ul className="flex flex-col gap-2">
              {keyPoints.map((keyPoint, index) => (
                <li
                  key={`${index}-${keyPoint.length}`}
                  className="flex gap-3 border-l-2 border-primary/60 bg-muted/30 p-2 md:p-3"
                >
                  <Text className="md:text-lg">{keyPoint}</Text>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <DialogFooter className="flex-col-reverse gap-2 md:flex-row md:gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isSaving}
              className="h-10 w-full rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-12 md:w-auto md:min-w-44 md:gap-2 md:px-7 md:text-lg"
            >
              닫기
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onRequestRegenerate}
            className="h-10 w-full rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-12 md:w-auto md:min-w-44 md:gap-2 md:px-7 md:text-lg"
          >
            <PencilLine className="size-4 md:size-5" />
            <span className="truncate">수정 후 다시 생성하기</span>
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="h-10 w-full rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-12 md:w-auto md:min-w-44 md:gap-2 md:px-7 md:text-lg"
          >
            {isSaving ? (
              <>
                <Spinner />
                <span className="truncate">저장 중</span>
              </>
            ) : (
              <>
                <Save className="size-4 md:size-5" />
                <span className="truncate">저장하기</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
