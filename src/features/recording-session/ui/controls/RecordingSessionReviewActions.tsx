import {RefreshCcw} from 'lucide-react';
import {removeRecordingDraft, removeTranscriptReviewDraft, useRecordingStore} from '@/entities/speech-to-text/client';
import {Button, Text} from '@/shared/components';

export function RecordingSessionReviewActions() {
  const resetRecording = useRecordingStore(state => state.resetRecording);
  const interruptionCount = useRecordingStore(state => state.interruptionCount);
  const hasRemainingInterruptions = interruptionCount > 0;

  function handleStartNewRecording() {
    resetRecording();
    removeRecordingDraft();
    removeTranscriptReviewDraft();
  }
  return (
    <div className="flex w-full md:max-w-90 flex-col mb-3 md:mb-0 md:gap-3 md:mt-6 px-8 md:px-0">
      <div className="hidden md:flex flex-col gap-4 rounded-xl border bg-muted/40 px-4 py-3">
        <div>
          <Text className="font-medium">녹음이 종료됐어요</Text>
          <Text variant="muted" className="mt-2 text-sm">
            우측에서 내용을 확인하고 회의 요약을 생성할 수 있어요.
          </Text>
        </div>
        <div>
          <Text className="font-medium">검토 상태</Text>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span>중단 구간</span>
              </span>
              <span
                className={`shrink-0 font-medium ${hasRemainingInterruptions ? 'text-amber-700' : 'text-emerald-700'}`}
              >
                {hasRemainingInterruptions ? `${interruptionCount}개 남음` : '확인 완료'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={handleStartNewRecording}
        className="h-10 shrink-0 rounded-lg px-3 text-sm md:h-14 md:w-full md:text-lg md:gap-2"
      >
        <RefreshCcw className="size-4 md:size-6" />새 녹음 시작
      </Button>
    </div>
  );
}
