'use client';

import {MeetingDetail} from './MeetingDetail';
import {SelectMeetingEmptyState} from './SelectMeetingEmptyState';
import {useMeetingHistorySearchParams} from '../../lib/useMeetingHistorySearchParams';

export function MeetingHistoryDetailPanel() {
  const {meetingId} = useMeetingHistorySearchParams();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl">
      {!meetingId && <SelectMeetingEmptyState />}
      {meetingId && <MeetingDetail meetingId={meetingId} />}
    </section>
  );
}
