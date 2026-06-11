import {format} from 'date-fns';
import {ko} from 'date-fns/locale';
import {MeetingDeleteDialog} from './delete/MeetingDeleteDialog';
import {MeetingEditDialog} from './edit/MeetingEditDialog';
import {MeetingMemoPanel} from './memo/MeetingMemoPanel';
import {useMeetingDetailQuery} from '@/entities/meeting/client';
import {Heading, Separator, Text} from '@/shared/components';
import {MeetingMemoDrawer} from './memo/MeetingMemoDrawer';

type Props = {
  meetingId: string;
};

function formatKoreanDateTime(value: string | Date) {
  return format(new Date(value), 'yyyy년 M월 d일 (EEEE) a h시 mm분', {locale: ko});
}

export function MeetingDetail({meetingId}: Props) {
  const {title, createdAt, updatedAt, summary, keyPoints, transcript, meetingDate} = useMeetingDetailQuery({
    id: meetingId,
  });

  const editProps = {meetingId, title, summary, keyPoints, meetingDate};
  const deleteProps = {meetingId, meetingDate};

  return (
    <section className="min-h-0 flex-1 md:grid md:grid-cols-[minmax(0,1fr)_21rem] md:gap-6 overflow-y-auto">
      <div className="flex flex-col min-h-0 @container/detail-main">
        <header className="flex flex-col gap-3 md:gap-2 px-4 pb-3 @4xl/detail-main:flex-row @4xl/detail-main:items-start @4xl/detail-main:justify-between @4xl/detail-main:gap-4">
          <div className="min-w-0">
            <Heading level="h2" className="wrap-break-word border-none text-lg md:text-2xl">
              {title}
            </Heading>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <Text variant="small" className="text-muted-foreground max-md:text-xs">
                <span className="text-foreground font-medium">작성일 : </span>
                <time dateTime={createdAt}>{formatKoreanDateTime(createdAt)}</time>
              </Text>
              <Text variant="small" className="text-muted-foreground max-md:text-xs">
                <span className="text-foreground font-medium">최근 수정 : </span>
                <time dateTime={updatedAt}>{formatKoreanDateTime(updatedAt)}</time>
              </Text>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 justify-end mb-1">
            <MeetingEditDialog {...editProps} />
            <MeetingDeleteDialog {...deleteProps} />
          </div>
        </header>
        <Separator />
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4 py-6">
          <article className="space-y-3">
            <Heading level="h3" className="text-base md:text-lg">
              회의 요약
            </Heading>
            <Text className="whitespace-pre-line">{summary}</Text>
          </article>
          <Separator />
          <article className="space-y-3">
            <Heading level="h3" className="text-base md:text-lg">
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
            <Heading level="h3" className="text-base md:text-lg">
              최종 회의 내용
            </Heading>
            <Text className="whitespace-pre-line mt-3 rounded-lg bg-muted/45 border border-border/70 p-4">
              {transcript}
            </Text>
          </article>
        </div>
      </div>
      <aside className="hidden min-h-0 md:block">
        <MeetingMemoPanel meetingId={meetingId} />
      </aside>

      <div className="fixed bottom-20 right-4 md:hidden">
        <MeetingMemoDrawer meetingId={meetingId} />
      </div>
    </section>
  );
}
