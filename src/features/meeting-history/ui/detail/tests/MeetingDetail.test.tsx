import {Suspense} from 'react';
import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Toaster as SonnerToaster} from 'sonner';
import {MeetingDetail} from '../MeetingDetail';
import {fetchUpdateMeeting, getMeetingById} from '@/entities/meeting/api/meetingApi';
import type {MeetingDetail as MeetingDetailResponse} from '@/entities/meeting/client';
import {withAllContext} from '@/shared/utils/withAllContext';

jest.mock('@/entities/meeting/api/meetingApi');

const mockedGetMeetingById = jest.mocked(getMeetingById);
const mockedFetchUpdateMeeting = jest.mocked(fetchUpdateMeeting);

const MEETING_ID = '5f5d8a97-022c-4ea9-bef6-c099a4df6fce';

const MEETING_DETAIL: MeetingDetailResponse = {
  id: MEETING_ID,
  title: '주간 기획 회의',
  meetingDate: '2026-05-18',
  createdAt: '2026-05-18T10:25:03.047Z',
  updatedAt: '2026-05-18T10:25:03.047Z',
  originTranscript: '원본 전사 내용',
  transcript: '최종 회의 내용입니다.',
  summary: '회의 요약입니다.',
  keyPoints: ['담당자를 정합니다.', '다음 회의 일정을 확인합니다.'],
};

function renderMeetingDetail() {
  return render(
    withAllContext(
      <>
        <SonnerToaster />
        <Suspense fallback={<div>회의록을 불러오는 중입니다.</div>}>
          <MeetingDetail meetingId={MEETING_ID} />
        </Suspense>
      </>,
    ),
  );
}

async function openEditDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', {name: '수정'}));

  return await screen.findByRole('dialog', {name: '회의록 수정'});
}

describe('@/src/features/meeting-history/ui/detail/MeetingDetail.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetMeetingById.mockResolvedValue(MEETING_DETAIL);
    mockedFetchUpdateMeeting.mockResolvedValue(undefined);
  });

  it('회의록 상세를 표시한다.', async () => {
    renderMeetingDetail();

    expect(await screen.findByRole('heading', {level: 2, name: '주간 기획 회의'})).toBeInTheDocument();
    expect(screen.getByText('회의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('담당자를 정합니다.')).toBeInTheDocument();
    expect(screen.getByText('최종 회의 내용입니다.')).toBeInTheDocument();
  });

  it('수정 다이얼로그를 연다.', async () => {
    const user = userEvent.setup();

    renderMeetingDetail();

    const dialog = await openEditDialog(user);

    expect(within(dialog).getByRole('textbox', {name: '회의 제목'})).toHaveValue('주간 기획 회의');
    expect(within(dialog).getByRole('textbox', {name: '회의 요약'})).toHaveValue('회의 요약입니다.');
    expect(within(dialog).getByRole('textbox', {name: '주요 사항 1'})).toHaveValue('담당자를 정합니다.');
    expect(within(dialog).getByRole('textbox', {name: '주요 사항 2'})).toHaveValue(
      '다음 회의 일정을 확인합니다.',
    );
  });

  it('수정 내용을 저장한다.', async () => {
    const user = userEvent.setup();

    renderMeetingDetail();

    const dialog = await openEditDialog(user);

    const titleInput = within(dialog).getByRole('textbox', {name: '회의 제목'});
    const summaryTextarea = within(dialog).getByRole('textbox', {name: '회의 요약'});
    const firstKeyPointInput = within(dialog).getByRole('textbox', {name: '주요 사항 1'});

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의 제목');
    await user.clear(summaryTextarea);
    await user.type(summaryTextarea, '수정된 회의 요약입니다.');
    await user.clear(firstKeyPointInput);
    await user.type(firstKeyPointInput, '수정된 주요 사항');
    await user.click(within(dialog).getByRole('button', {name: '주요 사항 추가'}));
    await user.type(within(dialog).getByRole('textbox', {name: '주요 사항 3'}), '추가된 주요 사항');
    await user.click(within(dialog).getByRole('button', {name: '2번째 주요 사항 삭제'}));
    await user.click(within(dialog).getByRole('button', {name: '저장하기'}));

    await waitFor(() => {
      expect(mockedFetchUpdateMeeting).toHaveBeenCalledWith({
        id: MEETING_ID,
        payload: {
          title: '수정된 회의 제목',
          summary: '수정된 회의 요약입니다.',
          keyPoints: ['수정된 주요 사항', '추가된 주요 사항'],
        },
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '회의록 수정'})).not.toBeInTheDocument();
    });
    expect(await screen.findByText('회의록 수정 완료')).toBeInTheDocument();
  });

  it('입력값을 검증한다.', async () => {
    const user = userEvent.setup();

    renderMeetingDetail();

    const dialog = await openEditDialog(user);

    await user.clear(within(dialog).getByRole('textbox', {name: '회의 제목'}));
    await user.clear(within(dialog).getByRole('textbox', {name: '회의 요약'}));
    await user.clear(within(dialog).getByRole('textbox', {name: '주요 사항 1'}));
    await user.click(within(dialog).getByRole('button', {name: '저장하기'}));

    expect(await within(dialog).findByText('회의 제목을 입력해주세요.')).toBeInTheDocument();
    expect(within(dialog).getByText('회의 요약을 입력해주세요.')).toBeInTheDocument();
    expect(within(dialog).getByText('주요 사항을 입력해주세요.')).toBeInTheDocument();
    expect(mockedFetchUpdateMeeting).not.toHaveBeenCalled();
  });

  it('저장 중 상태를 표시한다.', async () => {
    const user = userEvent.setup();
    let resolveUpdateMeeting!: () => void;

    mockedFetchUpdateMeeting.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveUpdateMeeting = () => resolve(undefined);
        }),
    );

    renderMeetingDetail();

    const dialog = await openEditDialog(user);

    await user.click(within(dialog).getByRole('button', {name: '저장하기'}));

    expect(await within(dialog).findByRole('button', {name: /저장 중/})).toBeDisabled();
    expect(within(dialog).getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    expect(within(dialog).getByRole('button', {name: '닫기'})).toBeDisabled();
    expect(within(dialog).getByRole('button', {name: '주요 사항 추가'})).toBeDisabled();
    expect(within(dialog).getByRole('button', {name: '1번째 주요 사항 삭제'})).toBeDisabled();
    expect(within(dialog).getByRole('textbox', {name: '회의 제목'})).toHaveAttribute('readonly');
    expect(within(dialog).getByRole('textbox', {name: '회의 요약'})).toHaveAttribute('readonly');
    expect(within(dialog).getByRole('textbox', {name: '주요 사항 1'})).toHaveAttribute('readonly');

    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', {name: '회의록 수정'})).toBeInTheDocument();

    resolveUpdateMeeting();

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '회의록 수정'})).not.toBeInTheDocument();
    });
  });

  it('저장 실패 후 다시 수정할 수 있다.', async () => {
    const user = userEvent.setup();

    mockedFetchUpdateMeeting.mockRejectedValue(new Error('회의 수정 실패'));

    renderMeetingDetail();

    const dialog = await openEditDialog(user);

    await user.click(within(dialog).getByRole('button', {name: '저장하기'}));

    expect(await within(dialog).findByRole('button', {name: '저장하기'})).toBeEnabled();
    expect(screen.getByRole('dialog', {name: '회의록 수정'})).toBeInTheDocument();
    expect(within(dialog).getByRole('button', {name: '닫기'})).toBeEnabled();
    expect(within(dialog).getByRole('button', {name: '주요 사항 추가'})).toBeEnabled();
    expect(within(dialog).getByRole('button', {name: '1번째 주요 사항 삭제'})).toBeEnabled();
    expect(within(dialog).getByRole('textbox', {name: '회의 제목'})).not.toHaveAttribute('readonly');
    expect(within(dialog).getByRole('textbox', {name: '회의 요약'})).not.toHaveAttribute('readonly');
    expect(within(dialog).getByRole('textbox', {name: '주요 사항 1'})).not.toHaveAttribute('readonly');
  });
});
