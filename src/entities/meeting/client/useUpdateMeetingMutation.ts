import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchUpdateMeeting} from '../api/meetingApi';
import {meetingQueryKeys} from './meeting-query';
import type {UpdateMeetingRequest} from '../model/schema';

type UpdateMeetingMutationVariables = {
  id: string;
  meetingDate: string;
  payload: UpdateMeetingRequest;
};

export function useUpdateMeetingMutation() {
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: ({id, payload}: UpdateMeetingMutationVariables) => fetchUpdateMeeting({id, payload}),
    retry: 0,
    onSuccess: (_data, {id, meetingDate}) => {
      void queryClient.invalidateQueries({
        queryKey: meetingQueryKeys.list.byDate(meetingDate),
      });

      void queryClient.invalidateQueries({
        queryKey: meetingQueryKeys.detail.byId(id),
      });
    },
  });

  return {
    updateMeeting: mutate,
    isUpdatingMeeting: isPending,
  };
}
