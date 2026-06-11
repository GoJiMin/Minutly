import {PencilLine, Sparkles} from 'lucide-react';
import {Button, FieldError} from '@/shared/components';

type ReviewSubmitActionsProps = {
  disabled: boolean;
  isReviewLocked: boolean;
  errorMessage?: string;
  onRequestRegenerate: () => void;
};

export function ReviewSubmitActions({
  disabled,
  errorMessage,
  isReviewLocked,
  onRequestRegenerate,
}: ReviewSubmitActionsProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
      {errorMessage && (
        <FieldError className="text-center text-sm md:text-start md:text-base" errors={[{message: errorMessage}]} />
      )}

      <div className="flex w-full items-center gap-2 md:ml-auto md:w-auto md:gap-3">
        {isReviewLocked && (
          <Button
            type="button"
            variant="outline"
            onClick={onRequestRegenerate}
            className="h-10 min-w-0 flex-1 rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-12 md:min-w-44 md:flex-none md:gap-2 md:px-7 md:text-lg"
          >
            <PencilLine className="size-4 md:size-5" />
            <span className="truncate">수정 후 다시 생성하기</span>
          </Button>
        )}

        <Button
          type="submit"
          disabled={disabled}
          className="h-10 min-w-0 flex-1 rounded-lg gap-1.5 px-3 text-sm font-semibold md:h-12 md:min-w-44 md:flex-none md:gap-2 md:px-7 md:text-lg"
        >
          <Sparkles className="size-4 md:size-5" />
          <span className="truncate">{isReviewLocked ? '요약 결과 확인하기' : '요약 생성하기'}</span>
        </Button>
      </div>
    </div>
  );
}
