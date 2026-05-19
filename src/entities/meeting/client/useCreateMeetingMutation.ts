import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchCreateMeeting} from '../api/meetingApi';
import {meetingQueryKeys} from './meeting-query';

export function useCreateMeetingMutation() {
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: fetchCreateMeeting,
    retry: 0,
    onSuccess: ({meetingDate}) => {
      const [year, month] = meetingDate.split('-');

      queryClient.invalidateQueries({
        queryKey: meetingQueryKeys.dates.month(year, month),
      });
    },
  });

  return {
    createMeeting: mutate,
    isCreatingMeeting: isPending,
  };
}
