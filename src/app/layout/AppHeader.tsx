'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from '@/shared/utils';

const navItems = [
  {href: '/', label: '녹음'},
  {href: '/history', label: '기록'},
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center border-b bg-inherit py-5 px-10">
      <Link
        href="/"
        className="text-3xl font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Minutly
      </Link>

      <nav aria-label="주요 메뉴" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-10">
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'px-1 py-1 border-b-2 border-transparent font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'border-foreground font-semibold text-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
