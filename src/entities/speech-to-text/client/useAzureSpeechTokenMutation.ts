import {useMutation} from '@tanstack/react-query';
import {fetchAzureSpeechToken} from '../api/sttApi';

export function useAzureSpeechTokenMutation() {
  const {mutateAsync, isPending} = useMutation({
    mutationKey: ['speech-to-text', 'azure-speech-token'],
    mutationFn: fetchAzureSpeechToken,
    retry: 0,
    gcTime: 0,
  });

  return {
    issueAzureSpeechToken: mutateAsync,
    isIssuingAzureSpeechToken: isPending,
  };
}
