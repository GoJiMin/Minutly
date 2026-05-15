import {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {Check, MapPin} from 'lucide-react';
import type {TranscriptInterruptionRange} from '../../../lib/transcript-editor/types';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {Button, Card, CardContent, CardHeader, Text} from '@/shared/components';

type Props = {
  interruptions: TranscriptInterruptionRange[];
  onMoveToInterruption: (interruptionId: string) => void;
  onMarkInterruptionReviewed: (interruptionId: string) => void;
};

export function InterruptionAlertPanel({interruptions, onMarkInterruptionReviewed, onMoveToInterruption}: Props) {
  const [reviewedInterruptionIds, setReviewedInterruptionIds] = useState<ReadonlySet<string>>(() => new Set());

  const {interruptionCount, confirmInterruptionChunk} = useRecordingStore(
    useShallow(state => ({
      interruptionCount: state.interruptionCount,
      confirmInterruptionChunk: state.confirmInterruptionChunk,
    })),
  );

  function confirmInterruption(interruptionId: string) {
    if (reviewedInterruptionIds.has(interruptionId)) return;

    setReviewedInterruptionIds(prev => {
      const next = new Set(prev);
      next.add(interruptionId);
      return next;
    });

    confirmInterruptionChunk();
    onMarkInterruptionReviewed(interruptionId);
  }

  const pendingInterruptions = interruptions.filter(interruption => !reviewedInterruptionIds.has(interruption.id));

  return (
    <Card size="sm" className="shrink-0 gap-3 rounded-lg border border-border bg-background py-3 shadow-none ring-0">
      <CardHeader>
        <Text className="font-medium leading-6">녹음 중단 구간 {interruptionCount}개</Text>
        <Text variant="small" className="text-muted-foreground">
          위치로 이동해 중단된 구간을 확인해 주세요.
        </Text>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 px-3">
        {pendingInterruptions.map(interruption => {
          const isReviewed = reviewedInterruptionIds.has(interruption.id) || interruptionCount === 0;

          return (
            <div
              key={interruption.id}
              className="inline-flex overflow-hidden rounded-md border border-border bg-background"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-none px-3 text-foreground"
                onClick={() => onMoveToInterruption(interruption.id)}
              >
                <MapPin className="size-4" />
                {interruption.order}번째
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-none border-l border-border px-3 text-muted-foreground hover:text-foreground disabled:bg-muted disabled:text-muted-foreground"
                disabled={isReviewed}
                onClick={() => confirmInterruption(interruption.id)}
              >
                <Check className="size-4" />
                확인
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
