import type {ReactNode} from 'react';
import {CircleAlert} from 'lucide-react';
import {Button} from './button';
import {Text} from './typography';
import {cn} from '@/shared/utils/cn';

type RetryErrorFallbackSize = 'default' | 'page';

type RetryErrorFallbackProps = {
  title: ReactNode;
  message: ReactNode;
  onRetry: () => void;
  className?: string;
  contentClassName?: string;
  retryLabel?: string;
  showIcon?: boolean;
  size?: RetryErrorFallbackSize;
};

function RetryErrorFallback({
  title,
  message,
  onRetry,
  className,
  contentClassName,
  retryLabel = '다시 시도',
  showIcon = false,
  size = 'default',
}: RetryErrorFallbackProps) {
  const isPageSize = size === 'page';

  return (
    <div className={className}>
      <div
        className={cn(
          'flex flex-col items-center justify-center px-6 text-center',
          isPageSize ? 'gap-5' : 'gap-3',
          contentClassName,
        )}
      >
        {showIcon && (
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CircleAlert aria-hidden className="size-6" />
          </div>
        )}

        <div className={isPageSize ? 'space-y-2' : 'space-y-1'}>
          <Text className={cn('font-medium', isPageSize && 'text-lg')}>{title}</Text>
          <Text variant="muted" className={cn('text-sm', isPageSize && 'leading-6')}>
            {message}
          </Text>
        </div>

        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}

export {RetryErrorFallback};
export type {RetryErrorFallbackProps};
