import type {Metadata} from 'next';
import {AppProvider} from '../providers';
import {pretendard} from '../styles';

export const metadata: Metadata = {
  title: {
    default: '미닛리',
    template: '%s | 미닛리',
  },
  description: '회의 내용을 실시간으로 텍스트화하고, AI가 회의 요약과 주요 사항을 정리해주는 회의록 서비스입니다.',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col w-full h-full bg-gray-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
