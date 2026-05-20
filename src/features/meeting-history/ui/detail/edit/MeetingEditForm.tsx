import {UpdateMeetingRequest, updateMeetingRequestSchema} from '@/entities/meeting/client';
import {Button, Field, FieldError, FieldLabel, Input, Textarea} from '@/shared/components';
import {zodResolver} from '@hookform/resolvers/zod';
import {Trash2} from 'lucide-react';
import {Controller, useForm, useWatch} from 'react-hook-form';

export type MeetingEditInitialValues = {
  meetingId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  meetingDate: string;
};

type MeetingEditFormProps = MeetingEditInitialValues & {
  isSaving: boolean;
  onSubmit: (payload: UpdateMeetingRequest) => void;
};

export function MeetingEditForm({title, summary, keyPoints, isSaving, onSubmit}: MeetingEditFormProps) {
  const form = useForm<UpdateMeetingRequest>({
    resolver: zodResolver(updateMeetingRequestSchema),
    defaultValues: {
      title,
      summary,
      keyPoints: [...keyPoints],
    },
    mode: 'onChange',
  });

  const formKeyPoints = useWatch({
    control: form.control,
    name: 'keyPoints',
  }) ?? [];

  function focusKeyPoint(index: number) {
    const fieldName = `keyPoints.${index}` as const;

    requestAnimationFrame(() => {
      form.setFocus(fieldName);
    });
  }

  function addKeyPoint() {
    if (formKeyPoints.length >= 20) return;

    const nextIndex = formKeyPoints.length;

    form.setValue('keyPoints', [...formKeyPoints, ''], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    focusKeyPoint(nextIndex);
  }

  function removeKeyPoint(index: number) {
    if (formKeyPoints.length <= 1) return;

    form.setValue(
      'keyPoints',
      formKeyPoints.filter((_, keyPointIndex) => keyPointIndex !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      },
    );
  }

  return (
    <form
      id="meeting-edit-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="min-h-0 flex-1 overflow-auto px-6 flex flex-col gap-4"
    >
      <Controller
        name="title"
        control={form.control}
        render={({field, fieldState}) => (
          <Field data-invalid={fieldState.invalid} className="shrink-0 gap-1.5">
            <FieldLabel className="pl-1 font-semibold tracking-normal" htmlFor="meeting-title">
              회의 제목
            </FieldLabel>
            <Input
              {...field}
              id="meeting-title"
              aria-invalid={fieldState.invalid}
              placeholder="회의 제목을 입력해주세요."
              readOnly={isSaving}
              autoComplete="off"
              autoFocus
              className="h-12 rounded-lg border-border bg-muted/30 px-3 font-medium focus-visible:bg-white"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="summary"
        control={form.control}
        render={({field, fieldState}) => (
          <Field data-invalid={fieldState.invalid} className="shrink-0 gap-1.5">
            <FieldLabel className="pl-1 font-semibold tracking-normal" htmlFor="meeting-summary">
              회의 요약
            </FieldLabel>
            <Textarea
              {...field}
              id="meeting-summary"
              aria-invalid={fieldState.invalid}
              placeholder="회의 요약을 입력해주세요."
              readOnly={isSaving}
              autoComplete="off"
              className="h-64 rounded-lg border-border bg-muted/30 px-3 md:text-base font-medium focus-visible:bg-white"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex flex-col gap-3">
        {formKeyPoints.map((_, index) => (
          <Controller
            key={`key-point-${index}`}
            name={`keyPoints.${index}`}
            control={form.control}
            render={({field, fieldState}) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor={`meeting-key-point-${index}`}>주요 사항 {index + 1}</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSaving || formKeyPoints.length <= 1}
                    aria-label={`${index + 1}번째 주요 사항 삭제`}
                    onClick={() => removeKeyPoint(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Input
                  {...field}
                  id={`meeting-key-point-${index}`}
                  aria-invalid={fieldState.invalid}
                  placeholder="주요 사항을 입력해주세요."
                  readOnly={isSaving}
                  autoComplete="off"
                  className="h-12 rounded-lg border-border bg-muted/30 px-3 font-medium focus-visible:bg-white"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}

        <Button
          className="mt-2"
          type="button"
          variant="outline"
          disabled={isSaving || formKeyPoints.length >= 20}
          onClick={addKeyPoint}
        >
          주요 사항 추가
        </Button>
      </div>
    </form>
  );
}
