import Lottie from 'lottie-react';
import {useReducedMotion} from 'framer-motion';
import meetingEmptyAnimation from '../../../../../public/animations/meeting-empty.json';
import {Text} from '@/shared/components';

export function SelectMeetingEmptyState() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center">
      <div className="flex flex-col items-center gap-5">
        <div aria-hidden className="h-62 w-110 max-w-full">
          <Lottie
            animationData={meetingEmptyAnimation}
            loop={!shouldReduceMotion}
            autoplay={!shouldReduceMotion}
            className="h-full w-full"
          />
        </div>

        <div className="space-y-2">
          <Text className="font-medium text-lg">회의록을 선택해주세요</Text>
          <Text variant="muted">캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.</Text>
        </div>
      </div>
    </div>
  );
}
