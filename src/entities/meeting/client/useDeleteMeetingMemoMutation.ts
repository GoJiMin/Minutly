import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchDeleteMeetingMemo} from '../api/meetingMemoApi';
import {meetingQueryKeys} from './meeting-query';
import type {GetMeetingMemosResponse} from '../model/types';

export function useDeleteMeetingMemoMutation() {
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: fetchDeleteMeetingMemo,
    retry: 0,
    onMutate: async ({meetingId, memoId}) => {
      const queryKey = meetingQueryKeys.memos.byMeetingId(meetingId);

      await queryClient.cancelQueries({queryKey});

      const previousMemos = queryClient.getQueryData<GetMeetingMemosResponse>(queryKey);

      if (!previousMemos) return {previousMemos};

      queryClient.setQueryData<GetMeetingMemosResponse>(queryKey, {
        memos: previousMemos.memos.filter(memo => memo.id !== memoId),
      });

      return {previousMemos};
    },
    onSuccess: (_data, {meetingId}) => {
      void queryClient.invalidateQueries({queryKey: meetingQueryKeys.memos.byMeetingId(meetingId)});
    },
    onError: (_error, {meetingId}, context) => {
      if (!context?.previousMemos) return;

      queryClient.setQueryData<GetMeetingMemosResponse>(
        meetingQueryKeys.memos.byMeetingId(meetingId),
        context.previousMemos,
      );
    },
  });

  return {deleteMeetingMemo: mutate};
}
