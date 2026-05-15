import {useShallow} from 'zustand/react/shallow';
import {TextAlignStart} from 'lucide-react';
import {RecordingOnboardingGuide} from './RecordingOnboardingGuide';
import {WaitingForSpeechIndicator} from './WaitingForSpeechIndicator';
import {TranscriptPreviewList} from './TranscriptPreviewList';
import {RecordingErrorGuide} from './RecordingErrorGuide';
import {RecordingSessionReviewForm} from './editor/RecordingSessionReviewForm';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Heading, Text} from '@/shared/components';

export function RecordingSessionFeedbackPanel() {
  const {status, hasPreviewChunks} = useRecordingStore(
    useShallow(state => ({
      status: state.status,
      hasPreviewChunks: state.previewChunks.length > 0,
    })),
  );

  const isError = status === 'error';
  const isWaitingForSpeech = status === 'recording' && !hasPreviewChunks;
  const isFinishRecording = status === 'transcript_review';
  const shouldShowHeader = !isFinishRecording;

  let content;

  if (isError) content = <RecordingErrorGuide />;
  else if (isFinishRecording) content = <RecordingSessionReviewForm />;
  else if (hasPreviewChunks) content = <TranscriptPreviewList />;
  else if (isWaitingForSpeech) content = <WaitingForSpeechIndicator />;
  else content = <RecordingOnboardingGuide />;

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border-2">
      {shouldShowHeader && (
        <header className="px-5 py-4 border-b-2">
          <div className="flex items-center gap-2 mb-1">
            <TextAlignStart size={22} />
            <Heading level="h3" className="font-bold">
              최근 기록
            </Heading>
          </div>
          <Text variant="muted">녹음 중 인식된 문장을 바로 확인할 수 있어요.</Text>
        </header>
      )}
      <div className={`flex min-h-0 flex-1 bg-white ${isFinishRecording ? 'p-0' : 'px-8 py-4'}`}>{content}</div>
    </section>
  );
}
