import {RefreshCcw} from 'lucide-react';
import {removeRecordingDraft, useRecordingStore} from '@/entities/speech-to-text/client';
import {Button, Text} from '@/shared/components';

export function RecordingSessionReviewActions() {
  const resetRecording = useRecordingStore(state => state.resetRecording);
  const interruptionCount = useRecordingStore(state => state.interruptionCount);
  const hasRemainingInterruptions = interruptionCount > 0;

  function handleStartNewRecording() {
    resetRecording();
    removeRecordingDraft();
  }
  return (
    <div className="mt-6 flex w-full max-w-90 flex-col gap-3">
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/40 px-4 py-3">
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
      <Button variant="outline" onClick={handleStartNewRecording} className="h-14 w-full rounded-xl text-lg gap-2">
        <RefreshCcw className="size-6" />새 녹음 시작
      </Button>
    </div>
  );
}
