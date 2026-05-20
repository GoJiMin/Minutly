import {Suspense} from 'react';
import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MeetingMemoPanel} from '../MeetingMemoPanel';
import {
  fetchCreateMeetingMemo,
  fetchDeleteMeetingMemo,
  getMeetingMemos,
} from '@/entities/meeting/api/meetingMemoApi';
import type {GetMeetingMemosResponse} from '@/entities/meeting/client';
import {withAllContext} from '@/shared/utils/withAllContext';

jest.mock('@/entities/meeting/api/meetingMemoApi');

const mockedGetMeetingMemos = jest.mocked(getMeetingMemos);
const mockedFetchCreateMeetingMemo = jest.mocked(fetchCreateMeetingMemo);
const mockedFetchDeleteMeetingMemo = jest.mocked(fetchDeleteMeetingMemo);

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';

const MEMOS: GetMeetingMemosResponse = {
  memos: [
    {
      id: 1,
      content: '다음 회의 전에 담당자를 확인하기',
    },
    {
      id: 2,
      content: '일정 표현을 한 번 더 검토하기',
    },
  ],
};

function renderMeetingMemoPanel() {
  return render(
    withAllContext(
      <Suspense fallback={<div>메모를 불러오는 중입니다.</div>}>
        <MeetingMemoPanel meetingId={MEETING_ID} />
      </Suspense>,
    ),
  );
}

describe('@/src/features/meeting-history/ui/detail/memo/MeetingMemoPanel.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetMeetingMemos.mockResolvedValue(MEMOS);
    mockedFetchCreateMeetingMemo.mockResolvedValue(undefined);
    mockedFetchDeleteMeetingMemo.mockResolvedValue(undefined);
  });

  it('저장된 메모를 표시한다.', async () => {
    renderMeetingMemoPanel();

    expect(await screen.findByText('메모')).toBeInTheDocument();
    expect(screen.getByText('이 회의에만 저장되는 내용이에요.')).toBeInTheDocument();
    expect(screen.getByText('다음 회의 전에 담당자를 확인하기')).toBeInTheDocument();
    expect(screen.getByText('일정 표현을 한 번 더 검토하기')).toBeInTheDocument();
    expect(mockedGetMeetingMemos).toHaveBeenCalledWith({meetingId: MEETING_ID});
  });

  it('메모를 추가하면 목록에 표시한다.', async () => {
    const user = userEvent.setup();
    const createdMemoContent = '새 메모 내용';
    let resolveCreateMeetingMemo!: () => void;

    mockedGetMeetingMemos
      .mockResolvedValueOnce(MEMOS)
      .mockResolvedValueOnce({
        memos: [
          ...MEMOS.memos,
          {
            id: 3,
            content: createdMemoContent,
          },
        ],
      });
    mockedFetchCreateMeetingMemo.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveCreateMeetingMemo = () => resolve(undefined);
        }),
    );

    renderMeetingMemoPanel();

    const memoInput = await screen.findByRole('textbox', {name: '메모 내용'});

    await user.type(memoInput, `${createdMemoContent}{Enter}`);

    await waitFor(() => {
      expect(mockedFetchCreateMeetingMemo).toHaveBeenCalledTimes(1);
    });
    expect(mockedFetchCreateMeetingMemo.mock.calls[0]?.[0]).toEqual({
      meetingId: MEETING_ID,
      payload: {
        content: createdMemoContent,
      },
    });
    expect(await screen.findByText(createdMemoContent)).toBeInTheDocument();
    expect(memoInput).toHaveValue('');

    resolveCreateMeetingMemo();

    await waitFor(() => {
      expect(mockedGetMeetingMemos).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText(createdMemoContent)).toBeInTheDocument();
  });

  it('메모를 삭제하면 목록에서 제거한다.', async () => {
    const user = userEvent.setup();
    let resolveDeleteMeetingMemo!: () => void;

    mockedGetMeetingMemos.mockResolvedValueOnce(MEMOS).mockResolvedValueOnce({
      memos: [MEMOS.memos[1]],
    });
    mockedFetchDeleteMeetingMemo.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDeleteMeetingMemo = () => resolve(undefined);
        }),
    );

    renderMeetingMemoPanel();

    const memo = await screen.findByText('다음 회의 전에 담당자를 확인하기');
    const memoItem = memo.closest('li');

    expect(memoItem).toBeInTheDocument();

    await user.click(within(memoItem as HTMLElement).getByRole('button', {name: '메모 삭제'}));

    await waitFor(() => {
      expect(mockedFetchDeleteMeetingMemo).toHaveBeenCalledTimes(1);
    });
    expect(mockedFetchDeleteMeetingMemo.mock.calls[0]?.[0]).toEqual({
      meetingId: MEETING_ID,
      memoId: 1,
    });
    expect(screen.queryByText('다음 회의 전에 담당자를 확인하기')).not.toBeInTheDocument();
    expect(screen.getByText('일정 표현을 한 번 더 검토하기')).toBeInTheDocument();

    resolveDeleteMeetingMemo();

    await waitFor(() => {
      expect(mockedGetMeetingMemos).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByText('다음 회의 전에 담당자를 확인하기')).not.toBeInTheDocument();
  });

  it('입력값을 검증한다.', async () => {
    const user = userEvent.setup();

    renderMeetingMemoPanel();

    const memoInput = await screen.findByRole('textbox', {name: '메모 내용'});

    await user.click(memoInput);
    await user.keyboard('{Enter}');

    expect(await screen.findByText('메모 내용을 입력해주세요.')).toBeInTheDocument();
    expect(mockedFetchCreateMeetingMemo).not.toHaveBeenCalled();

    await user.type(memoInput, 'a'.repeat(501));
    await user.keyboard('{Enter}');

    expect(await screen.findByText('메모 내용은 최대 500자 이하로 입력해주세요.')).toBeInTheDocument();
    expect(mockedFetchCreateMeetingMemo).not.toHaveBeenCalled();
  });
});
