import {useShallow} from 'zustand/react/shallow';
import {useMicrophoneDevices} from '../lib/useMicrophoneDevices';
import {useRecordingStore} from '@/entities/speech-to-text/client';
import {
  Button,
  Text,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components';
import {Mic} from 'lucide-react';

const DEFAULT_MICROPHONE_SELECT_VALUE = '__default_microphone__';

export default function SelectMicrophones() {
  const {selectedMicrophone, setSelectedMicrophone} = useRecordingStore(
    useShallow(state => ({
      selectedMicrophone: state.selectedMicrophone,
      setSelectedMicrophone: state.setSelectedMicrophone,
    })),
  );

  const {microphoneOptions, needsMicrophoneAccess, requestMicrophoneAccess} = useMicrophoneDevices();
  const selectValue = selectedMicrophone?.id ?? DEFAULT_MICROPHONE_SELECT_VALUE;

  function handleValueChange(value: string) {
    if (value === DEFAULT_MICROPHONE_SELECT_VALUE) {
      setSelectedMicrophone(null);
      return;
    }

    const selectedOptions = microphoneOptions.find(opt => opt.id === value);
    if (selectedOptions) setSelectedMicrophone(selectedOptions);
  }

  if (needsMicrophoneAccess) {
    return (
      <div className="rounded-xl border bg-muted/40 px-3 py-3">
        <Text className="text-sm font-medium leading-6">사용할 마이크를 선택하려면 권한이 필요해요.</Text>
        <Text variant="muted" className="mt-1 text-sm leading-6">
          권한을 허용하면 연결된 마이크 목록을 불러올 수 있어요.
        </Text>

        <Button type="button" variant="outline" size="sm" onClick={requestMicrophoneAccess} className="mt-3 w-full">
          <Mic className="size-4" />
          마이크 권한 확인
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Text variant="small" className="ml-2 text-muted-foreground">
        입력 마이크
      </Text>
      <Select onValueChange={handleValueChange} value={selectValue}>
        <SelectTrigger className="h-11 w-full bg-muted px-3 text-sm">
          <SelectValue>{selectedMicrophone?.label ?? '브라우저 기본 마이크'}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value={DEFAULT_MICROPHONE_SELECT_VALUE}>브라우저 기본 마이크</SelectItem>

            {microphoneOptions.map(({id, label}) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
