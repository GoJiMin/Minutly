import Lottie from 'lottie-react';
import {useReducedMotion} from 'framer-motion';
import meetingEmptyAnimation from '../../../../../public/animations/meeting-empty.json';
import {Text} from '@/shared/components';

export function SelectMeetingEmptyState() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center">
      <div className="flex flex-col items-center gap-3 md:gap-5">
        <div aria-hidden className="h-50 w-80 md:h-62 md:w-110 max-w-full">
          <Lottie
            animationData={meetingEmptyAnimation}
            loop={!shouldReduceMotion}
            autoplay={!shouldReduceMotion}
            className="h-full w-full"
          />
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <Text className="font-medium text-base md:text-lg">회의록을 선택해주세요</Text>
          <Text variant="muted" className="max-w-72 text-sm md:max-w-none md:text-base">
            <span className="md:hidden">오른쪽 아래 캘린더 버튼에서 날짜와 회의록을 선택할 수 있어요.</span>
            <span className="hidden md:inline">
              캘린더에서 날짜를 고른 뒤, 왼쪽 목록의 회의록을 누르면 내용이 표시됩니다.
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
