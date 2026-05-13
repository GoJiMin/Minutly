import {RecordingErrorCode, useRecordingStore} from '@/entities/speech-to-text/client';
import {Heading, Text} from '@/shared/components';
import {CircleAlert} from 'lucide-react';

type ErrorGuideContent = {
  title: string;
  description: string;
  recoverySteps?: string[];
};

const ERROR_GUIDES: Record<RecordingErrorCode, ErrorGuideContent> = {
  microphone_permission_denied: {
    title: '마이크 권한이 거부되어 있어요.',
    description: '브라우저 설정에서 이 사이트의 마이크 권한을 허용한 뒤 다시 시도해주세요.',
    recoverySteps: [
      '상단 주소창 왼쪽의 사이트 정보 또는 자물쇠 아이콘을 눌러주세요.',
      '사이트 설정에서 마이크 권한을 허용으로 변경해주세요.',
      '페이지를 새로고침한 뒤 다시 녹음을 시작해주세요.',
    ],
  },
  microphone_not_found: {
    title: '사용 가능한 마이크를 찾지 못했어요.',
    description: '마이크나 헤드셋이 연결되어 있는지 확인한 뒤 다시 시도해주세요.',
    recoverySteps: [
      'USB 마이크나 헤드셋이 제대로 연결되어 있는지 확인해주세요.',
      'Bluetooth 마이크를 사용 중이라면 기기 연결 상태를 확인해주세요.',
      '마이크를 연결한 뒤 페이지를 새로고침하고 다시 녹음을 시작해주세요.',
    ],
  },
  microphone_api_unavailable: {
    title: '현재 환경에서는 마이크를 사용할 수 없어요.',
    description: '최신 버전의 Chrome, Edge, Firefox, Safari에서 접속하면 대부분 정상적으로 사용할 수 있어요.',
    recoverySteps: [
      '브라우저가 최신 버전인지 확인해주세요.',
      '주소가 http://로 시작한다면 https:// 주소로 다시 접속해주세요.',
      '앱 안의 내장 브라우저에서 열었다면 Chrome이나 Safari 같은 일반 브라우저로 다시 열어주세요.',
    ],
  },
  microphone_access_failed: {
    title: '마이크 입력을 시작하지 못했어요.',
    description: '다른 앱이 마이크를 사용 중이거나 시스템에서 마이크 접근을 막고 있을 수 있어요.',
    recoverySteps: [
      'Zoom, Meet, Teams처럼 마이크를 사용하는 앱을 잠시 종료해주세요.',
      '운영체제 설정에서 브라우저의 마이크 접근이 허용되어 있는지 확인해주세요.',
      '마이크를 다시 연결하거나 페이지를 새로고침한 뒤 다시 시도해주세요.',
    ],
  },
  speech_token_failed: {
    title: '음성 인식 서비스에 연결하지 못했어요.',
    description: '잠시 후 다시 시도해주세요.',
  },
  speech_recognizer_start_failed: {
    title: '음성 인식을 시작하지 못했어요.',
    description: '마이크 권한과 네트워크 상태를 확인한 뒤 다시 시작해주세요.',
  },
  speech_recognition_canceled: {
    title: '음성 인식이 중단되었어요.',
    description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
  },
  speech_session_stopped: {
    title: '녹음 세션이 중단되었어요.',
    description: '녹음을 다시 시작해주세요.',
  },
};

const FALLBACK_ERROR_GUIDE: ErrorGuideContent = {
  title: '녹음 상태를 확인하지 못했어요.',
  description: '일시적인 문제가 발생했어요. 다시 녹음을 시작해주세요.',
};

export function RecordingErrorGuide() {
  const errorCode = useRecordingStore(state => state.errorCode);
  const guide = errorCode ? ERROR_GUIDES[errorCode] : FALLBACK_ERROR_GUIDE;

  return (
    <div role="alert" className="flex flex-1 items-center justify-center">
      <div className="flex max-w-xl flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleAlert className="size-7" />
        </div>

        <Heading level="h3" className="font-bold">
          {guide.title}
        </Heading>

        <Text variant="muted" className="mt-2">
          {guide.description}
        </Text>

        {guide.recoverySteps && (
          <ol className="mt-6 w-full space-y-3 text-left">
            {guide.recoverySteps.map((step, index) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {index + 1}
                </span>
                <Text>{step}</Text>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
