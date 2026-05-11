import {FileText, RefreshCcw, Sparkles} from 'lucide-react';
import {removeRecordingDraft, useRecordingStore} from '@/entities/speech-to-text/client';
import {Button, Text} from '@/shared/components';

export function RecordingSessionReviewActions() {
  const resetRecording = useRecordingStore(state => state.resetRecording);

  function handleStartNewRecording() {
    resetRecording();
    removeRecordingDraft();
  }
  return (
    <div className="mt-10 flex w-full max-w-90 flex-col gap-3">
      <div className="rounded-xl border bg-muted/40 px-4 py-3">
        <Text className="font-medium">녹음이 종료됐어요</Text>
        <Text variant="muted" className="mt-1 text-sm">
          내용을 검토하고 회의 요약을 생성할 수 있어요.
        </Text>
      </div>

      <Button className="h-14 w-full rounded-xl text-lg gap-2">
        <Sparkles className="size-6" />
        요약 생성
      </Button>

      <Button variant="outline" className="h-14 w-full rounded-xl text-lg gap-2">
        <FileText className="size-6" />
        내용 검토
      </Button>

      <Button variant="outline" onClick={handleStartNewRecording} className="h-14 w-full rounded-xl text-lg gap-2">
        <RefreshCcw className="size-6" />새 녹음 시작
      </Button>
    </div>
  );
}
