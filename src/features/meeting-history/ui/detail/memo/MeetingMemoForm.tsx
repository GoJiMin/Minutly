import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  type CreateMeetingMemoRequest,
  createMeetingMemoRequestSchema,
  useCreateMeetingMemoMutation,
} from '@/entities/meeting/client';
import {Field, FieldError, Input} from '@/shared/components';

type Props = {
  meetingId: string;
};

export function MeetingMemoForm({meetingId}: Props) {
  const form = useForm<CreateMeetingMemoRequest>({
    resolver: zodResolver(createMeetingMemoRequestSchema),
    defaultValues: {
      content: '',
    },
    mode: 'onSubmit',
  });

  const {createMeetingMemo} = useCreateMeetingMemoMutation();

  function onSubmit(payload: CreateMeetingMemoRequest) {
    const submittedContent = payload.content;
    form.reset();

    createMeetingMemo(
      {meetingId, payload},
      {
        onError: () => {
          form.setValue('content', submittedContent, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        },
      },
    );
  }

  return (
    <form className="border-t border-border pt-3 px-3" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={form.control}
        render={({field, fieldState}) => (
          <Field data-invalid={fieldState.invalid}>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="px-1 text-xs leading-5 text-center" />
            )}
            <Input
              {...field}
              placeholder="메모 입력 후 Enter"
              aria-label="메모 내용"
              aria-invalid={fieldState.invalid}
              className="h-10 rounded-xl bg-background px-4 text-sm"
              autoComplete="off"
            />
          </Field>
        )}
      />
    </form>
  );
}
