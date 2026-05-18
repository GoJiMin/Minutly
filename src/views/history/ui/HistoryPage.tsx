type Props = {
  searchParams: Promise<{
    year: string;
    month: string;
    meetingId: string;
  }>;
};

export async function HistoryPage({searchParams}: Props) {
  const {year, month, meetingId} = await searchParams;

  return (
    <section>
      <h2>히스토리 페이지</h2>
      <p>year: {year}</p>
      <p>month: {month}</p>
      <p>meetingId: {meetingId}</p>
    </section>
  );
}
