import {useMutation} from '@tanstack/react-query';
import {fetchCreateMeeting} from '../api/meetingApi';

export function useCreateMeetingMutation() {
  const {mutate, isPending} = useMutation({
    mutationFn: fetchCreateMeeting,
    retry: 0,
  });

  return {
    createMeeting: mutate,
    isCreatingMeeting: isPending,
  };
}
