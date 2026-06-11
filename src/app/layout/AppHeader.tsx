'use client';

import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {cn} from '@/shared/utils';

const navItems = [
  {href: '/', label: '녹음'},
  {href: '/history', label: '기록'},
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between md:justify-normal border-b bg-inherit px-6 py-4 md:py-5 md:px-10">
      <Link
        href="/"
        className="inline-flex items-center text-xl md:text-3xl gap-2 font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Image src="/logo.png" alt="logo" width={48} height={48} priority className="size-9 md:size-11 shrink-0" />
        <span>
          Minut<span className="text-foreground/60">ly</span>
        </span>
      </Link>

      <nav
        aria-label="주요 메뉴"
        className="md:absolute flex md:left-1/2 md:-translate-x-1/2 items-center gap-5 md:gap-10"
      >
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
