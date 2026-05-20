import {useRouter} from 'next/navigation';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchDeleteMeeting} from '../api/meetingApi';
import {meetingQueryKeys} from './meeting-query';

type DeleteMeetingMutationVariables = {
  id: string;
  meetingDate: string;
};

export function useDeleteMeetingMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: ({id}: DeleteMeetingMutationVariables) => fetchDeleteMeeting({id}),
    retry: 0,
    onSuccess: (_data, {id, meetingDate}) => {
      const [year, month] = meetingDate.split('-');

      router.replace('/history');

      void queryClient.invalidateQueries({
        queryKey: meetingQueryKeys.dates.month(year, month),
      });

      void queryClient.invalidateQueries({
        queryKey: meetingQueryKeys.list.byDate(meetingDate),
      });

      queryClient.removeQueries({
        queryKey: meetingQueryKeys.detail.byId(id),
      });

      queryClient.removeQueries({
        queryKey: meetingQueryKeys.memos.byMeetingId(id),
      });
    },
  });

  return {
    deleteMeeting: mutate,
    isDeletingMeeting: isPending,
  };
}
