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

      <Button type="submit" disabled={disabled} className="h-11 min-w-36 rounded-lg gap-2 text-base">
        {isSubmitting ? (
          <>
            <Spinner />
            요약 생성 중
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            요약 생성
          </>
        )}
      </Button>
    </div>
  );
}
