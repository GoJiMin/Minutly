import {PencilLine, Sparkles} from 'lucide-react';
import {Button, FieldError, Spinner} from '@/shared/components';

type ReviewSubmitActionsProps = {
  isSubmitting: boolean;
  disabled: boolean;
  isReviewLocked: boolean;
  errorMessage?: string;
  onRequestRegenerate: () => void;
};

export function ReviewSubmitActions({
  isSubmitting,
  disabled,
  errorMessage,
  isReviewLocked,
  onRequestRegenerate,
}: ReviewSubmitActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        {errorMessage && <FieldError className="text-base" errors={[{message: errorMessage}]} />}
      </div>
      <div className="flex items-center gap-3">
        {isReviewLocked && (
          <Button
            type="button"
            variant="outline"
            onClick={onRequestRegenerate}
            className="h-12 min-w-44 rounded-lg gap-2 px-7 text-lg font-semibold"
          >
            <PencilLine className="size-5" />
            수정 후 다시 생성하기
          </Button>
        )}

        <Button type="submit" disabled={disabled} className="h-12 min-w-44 rounded-lg gap-2 px-7 text-lg font-semibold">
          {isSubmitting ? (
            <>
              <Spinner />
              요약 생성 중
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              {isReviewLocked ? '요약 결과 확인하기' : '요약 생성하기'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
