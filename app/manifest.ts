import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '미닛리',
    short_name: '미닛리',
    description: '회의 내용을 실시간으로 텍스트화하고 AI가 회의 요약과 주요 사항을 정리해주는 회의록 서비스입니다.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#F8FAFC',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
