'use client';

import {type FormEvent, useState} from 'react';
import {Trash2} from 'lucide-react';
import {Button, Input, Text} from '@/shared/components';

type MeetingMemo = {
  id: string;
  text: string;
};

const MOCK_MEMOS: MeetingMemo[] = [
  {
    id: 'c3c6863b-d99b-4e20-9143-c15b0b217c90',
    text: '다음 회의 전에 액션 아이템 담당자를 다시 확인하기',
  },
  {
    id: 'bc457318-824d-4628-88f4-a9490828a618',
    text: '요약 내용 중 일정 관련 표현은 나중에 한 번 더 검토하기',
  },
];

export function MeetingMemoPanel() {
  // TODO: 저장 API가 생기면 목 데이터와 로컬 상태를 서버 상태로 교체한다.
  const [memos, setMemos] = useState<MeetingMemo[]>(MOCK_MEMOS);
  const [memoText, setMemoText] = useState('');

  const trimmedMemoText = memoText.trim();

  function addMemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedMemoText) return;

    setMemos(prevMemos => [
      ...prevMemos,
      {
        id: crypto.randomUUID(),
        text: trimmedMemoText,
      },
    ]);
    setMemoText('');
  }

  function deleteMemo(id: string) {
    setMemos(prevMemos => prevMemos.filter(memo => memo.id !== id));
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-border bg-muted/30 py-3">
      <header className="px-4 pb-3 pt-1">
        <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-foreground/20" aria-hidden />
        <Text className="font-semibold leading-6">메모</Text>
        <Text variant="muted" className="text-xs leading-5">
          중요한 내용을 등록할 수 있어요.
        </Text>
      </header>

      <ul className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {memos.map(memo => (
          <li key={memo.id} className="flex items-end justify-end gap-1.5">
            <div className="max-w-[90%] rounded-2xl rounded-br-sm border border-border/80 bg-background px-3 py-2 text-foreground">
              <Text className="text-sm leading-6 text-current">{memo.text}</Text>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="mb-0.5 text-muted-foreground hover:text-destructive"
              aria-label="메모 삭제"
              onClick={() => deleteMemo(memo.id)}
            >
              <Trash2 aria-hidden className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <form className="border-t border-border pt-3 px-3" onSubmit={addMemo}>
        <Input
          value={memoText}
          onChange={event => setMemoText(event.target.value)}
          placeholder="메모 입력 후 Enter"
          aria-label="메모 내용"
          className="h-10 rounded-xl bg-background px-4 text-sm"
        />
      </form>
    </div>
  );
}
