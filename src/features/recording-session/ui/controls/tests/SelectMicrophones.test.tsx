import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectMicrophones from '../SelectMicrophones';
import {useMicrophoneDevices} from '../../../lib/useMicrophoneDevices';
import {readPreferredMicrophone, savePreferredMicrophone, useRecordingStore} from '@/entities/speech-to-text/client';

jest.mock('../../../lib/useMicrophoneDevices', () => ({
  useMicrophoneDevices: jest.fn(),
}));

const mockedUseMicrophoneDevices = jest.mocked(useMicrophoneDevices);

describe('@/src/features/recording-session/ui/controls/SelectMicrophones.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    useRecordingStore.getState().resetRecording();
    mockedUseMicrophoneDevices.mockReturnValue({
      microphoneOptions: [{id: 'mic-1', label: 'iPhone 마이크'}],
      needsMicrophoneAccess: false,
      requestMicrophoneAccess: jest.fn(),
    });
  });

  it('마이크를 선택하면 선택 상태와 마지막 선택 마이크를 저장한다.', async () => {
    const user = userEvent.setup();

    render(<SelectMicrophones />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: 'iPhone 마이크'}));

    expect(useRecordingStore.getState().selectedMicrophone).toEqual({id: 'mic-1', label: 'iPhone 마이크'});
    expect(readPreferredMicrophone()).toEqual({id: 'mic-1', label: 'iPhone 마이크'});
  });

  it('브라우저 기본 마이크를 선택하면 마지막 선택 마이크를 제거한다.', async () => {
    const user = userEvent.setup();
    useRecordingStore.setState({selectedMicrophone: {id: 'mic-1', label: 'iPhone 마이크'}});
    savePreferredMicrophone({id: 'mic-1', label: 'iPhone 마이크'});

    render(<SelectMicrophones />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', {name: '브라우저 기본 마이크'}));

    expect(useRecordingStore.getState().selectedMicrophone).toBeNull();
    expect(readPreferredMicrophone()).toBeNull();
  });
});
