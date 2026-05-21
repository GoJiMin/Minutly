import {Text} from '@/shared/components';

const ONBOARDING_STEPS = [
  '녹음을 시작하면 회의 내용을 문장 단위로 인식해요.',
  '원활한 녹음을 위해 마이크 권한을 허용해주세요.',
  '필요한 경우 사용할 마이크를 먼저 선택할 수 있어요.',
  '인식된 문장은 최근 기록에 최대 10개까지 표시돼요.',
  '중간에 쉬어야 한다면 녹음을 잠시 멈춘 뒤 다시 이어갈 수 있어요.',
  '녹음이 끝나면 기록을 검토한 뒤 회의 요약을 생성할 수 있어요.',
  '완성된 회의록은 저장해 다시 확인할 수 있어요.',
  '완성된 회의록의 회의 내용을 수정해 회의 요약을 다시 생성할 수 있어요.',
];

export function RecordingOnboardingGuide() {
  return (
    <ol className="grid w-full flex-1 grid-rows-8">
      {ONBOARDING_STEPS.map((step, index) => (
        <li
          key={step}
          className="grid min-h-0 grid-cols-[3rem_1fr] items-center border-b border-border/60 last:border-b-0"
        >
          <span className="text-lg font-semibold tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <Text className="text-lg text-foreground">{step}</Text>
        </li>
      ))}
    </ol>
  );
}
