import {Button, Separator, Text} from '@/shared/components';
import {formatKoreanDate} from '@/shared/utils';
import {CirclePause, CirclePlay, CircleStop} from 'lucide-react';

export default function RecordingSessionControlsPanel() {
  return (
    <section className="w-110 flex flex-col border-2 rounded-xl px-5 py-6 gap-3">
      <div className="flex flex-1 flex-col justify-center items-center">
        <time className="text-2xl text-foreground">{formatKoreanDate(new Date())}</time>
        <div className="mt-4 text-7xl font-bold tabular-nums">00:00:00</div>
        <div className="mt-10 flex w-full max-w-90 flex-col gap-3">
          <Button className="h-14 w-full rounded-xl text-lg gap-2">
            <CirclePlay className="size-6" />
            녹음 시작
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14 rounded-xl text-lg gap-2">
              <CirclePause className="size-6" />
              일시 정지
            </Button>

            <Button variant="outline" className="h-14 rounded-xl text-lg gap-2">
              <CircleStop className="size-6" />
              녹음 종료
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-1">
        <Text className="ml-2 text-muted-foreground">입력 마이크</Text>
        <div className="border bg-white w-full h-12 rounded-lg flex items-center p-4 text-muted-foreground">
          Macbook Pro Microphone
        </div>
      </div>
    </section>
  );
}
