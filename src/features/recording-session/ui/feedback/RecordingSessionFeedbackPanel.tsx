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

  let content;

  if (isError) content = <RecordingErrorGuide />;
  else if (isFinishRecording) content = <RecordingSessionReviewForm />;
  else if (hasPreviewChunks) content = <TranscriptPreviewList />;
  else if (isWaitingForSpeech) content = <WaitingForSpeechIndicator />;
  else content = <RecordingOnboardingGuide />;

  const title = isFinishRecording ? '전사 검토' : '최근 기록';
  const description = isFinishRecording
    ? '요약 생성 전 인식된 전사 내용을 확인해 주세요.'
    : '녹음 중 인식된 문장을 바로 확인할 수 있어요.';

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border-2">
      <header className="px-5 py-4 border-b-2">
        <div className="flex items-center gap-2 mb-1">
          <TextAlignStart size={22} />
          <Heading level="h3" className="font-bold">
            {title}
          </Heading>
        </div>
        <Text variant="muted">{description}</Text>
      </header>
      <div className="flex min-h-0 flex-1 bg-white px-8 py-4">{content}</div>
    </section>
  );
}
