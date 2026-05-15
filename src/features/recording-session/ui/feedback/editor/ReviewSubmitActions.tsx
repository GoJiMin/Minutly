import {Sparkles} from 'lucide-react';
import {Button, FieldError, Spinner} from '@/shared/components';

type ReviewSubmitActionsProps = {
  isSubmitting: boolean;
  disabled: boolean;
  errorMessage?: string;
};

export function ReviewSubmitActions({isSubmitting, disabled, errorMessage}: ReviewSubmitActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        {errorMessage && <FieldError className="text-base" errors={[{message: errorMessage}]} />}
      </div>

      <Button type="submit" disabled={disabled} className="h-12 min-w-44 rounded-lg gap-2 px-7 text-lg font-semibold">
        {isSubmitting ? (
          <>
            <Spinner />
            요약 생성 중
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            요약 생성
          </>
        )}
      </Button>
    </div>
  );
}
