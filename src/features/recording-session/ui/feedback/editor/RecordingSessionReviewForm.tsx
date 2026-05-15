import z from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {createSummaryRequestSchema} from '@/entities/summary/client';
import {createMeetingTitlePrefix, toMeetingDate} from '@/shared/utils';
import {ReviewTitleField} from './ReviewTitleField';
import {Button} from '@/shared/components';

const reviewFormSchema = createSummaryRequestSchema.pick({
  title: true,
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function RecordingSessionReviewForm() {
  const today = toMeetingDate(new Date());

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: createMeetingTitlePrefix(today),
    },
  });

  function onSubmit({title}: ReviewFormValues) {
    console.log(title);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full min-h-0 flex-1 flex-col gap-3">
      <ReviewTitleField control={form.control} />
    </form>
  );
}
