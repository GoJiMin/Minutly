import {useMutation, useQueryClient} from '@tanstack/react-query';
import {fetchCreateMeetingMemo} from '../api/meetingMemoApi';
import {meetingQueryKeys} from './meeting-query';
import type {GetMeetingMemosResponse, MeetingMemo} from '../model/types';

export function useCreateMeetingMemoMutation() {
  const queryClient = useQueryClient();

  const {mutate} = useMutation({
    mutationFn: fetchCreateMeetingMemo,
    retry: 0,
    onMutate: async ({meetingId, payload}) => {
      const queryKey = meetingQueryKeys.memos.byMeetingId(meetingId);

      await queryClient.cancelQueries({queryKey});

      const previousMemos = queryClient.getQueryData<GetMeetingMemosResponse>(queryKey);

      if (!previousMemos) return {previousMemos};

      const optimisticMemo: MeetingMemo = {
        id: -Date.now(),
        content: payload.content.trim(),
      };

      queryClient.setQueryData<GetMeetingMemosResponse>(queryKey, {
        memos: [...previousMemos.memos, optimisticMemo],
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

  return {createMeetingMemo: mutate};
}
