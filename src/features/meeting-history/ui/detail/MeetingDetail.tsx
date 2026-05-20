import {format} from 'date-fns';
import {ko} from 'date-fns/locale';
import {MeetingMemoPanel} from './MeetingMemoPanel';
import {useMeetingDetailQuery} from '@/entities/meeting/client';
import {Heading, Separator, Text} from '@/shared/components';

type Props = {
  meetingId: string;
};

function formatKoreanDateTime(value: string | Date) {
  return format(new Date(value), 'yyyy년 M월 d일 (EEEE) a h시 mm분', {locale: ko});
}

export function MeetingDetail({meetingId}: Props) {
  const {title, createdAt, updatedAt, summary, keyPoints, transcript} = useMeetingDetailQuery({id: meetingId});

  return (
    <section className="min-h-0 flex-1 grid grid-cols-[minmax(0,1fr)_21rem] gap-6">
      <div className="flex flex-col min-h-0">
        <header className="px-4 pb-3">
          <Heading level="h2" className="border-none text-2xl">
            {title}
          </Heading>
          <div className="flex gap-3">
            <Text variant="small" className="text-muted-foreground">
              <span className="text-foreground font-medium">작성일 : </span>
              <time dateTime={createdAt}>{formatKoreanDateTime(createdAt)}</time>
            </Text>
            <Text variant="small" className="text-muted-foreground">
              <span className="text-foreground font-medium">최근 수정 : </span>
              <time dateTime={updatedAt}>{formatKoreanDateTime(updatedAt)}</time>
            </Text>
          </div>
        </header>
        <Separator />
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 py-6">
          <article className="space-y-3">
            <Heading level="h3" className="text-lg">
              회의 요약
            </Heading>
            <Text className="whitespace-pre-line">{summary}</Text>
          </article>
          <Separator />
          <article className="space-y-3">
            <Heading level="h3" className="text-lg">
              주요 사항
            </Heading>
            <ul className="flex flex-col gap-2">
              {keyPoints.map((keyPoint, index) => (
                <li
                  key={`${index}-${keyPoint.length}`}
                  className="flex gap-3 border-l-2 border-primary/60 bg-muted/30 p-3"
                >
                  <Text>{keyPoint}</Text>
                </li>
              ))}
            </ul>
          </article>
          <Separator />
          <article className="space-y-3">
            <Heading level="h3" className="text-lg">
              전사 원문
            </Heading>
            <Text className="whitespace-pre-line mt-3 rounded-lg bg-muted/45 border border-border/70 p-4">
              {transcript}
            </Text>
          </article>
        </div>
      </div>
      <aside className="min-h-0">
        <MeetingMemoPanel key={meetingId} />
      </aside>
    </section>
  );
}
