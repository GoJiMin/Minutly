import {Controller, type Control} from 'react-hook-form';
import type {ReviewFormValues} from './RecordingSessionReviewForm';
import {Field, FieldError, FieldLabel, Input} from '@/shared/components';

type ReviewTitleFieldProps = {
  control: Control<ReviewFormValues>;
  readOnly: boolean;
};

export function ReviewTitleField({control, readOnly}: ReviewTitleFieldProps) {
  return (
    <Controller
      name="title"
      control={control}
      render={({field, fieldState}) => (
        <Field data-invalid={fieldState.invalid} className="shrink-0 gap-3">
          <FieldLabel className="pl-1 text-lg font-semibold tracking-normal" htmlFor="recording-review-title">
            회의 제목
          </FieldLabel>
          <Input
            {...field}
            id="recording-review-title"
            aria-invalid={fieldState.invalid}
            placeholder="회의 제목을 입력해주세요."
            autoComplete="off"
            readOnly={readOnly}
            autoFocus
            className="h-12 rounded-lg border-border bg-muted/30 px-3 text-lg font-medium focus-visible:bg-white"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
