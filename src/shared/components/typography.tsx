import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/shared/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

const headingVariants = cva('scroll-m-20 font-heading text-foreground', {
  variants: {
    level: {
      h1: 'text-3xl md:text-4xl font-extrabold',
      h2: 'border-b border-border pb-2 text-2xl md:text-3xl font-semibold first:mt-0',
      h3: 'text-xl md:text-2xl font-semibold',
      h4: 'text-lg md:text-xl font-semibold',
    },
  },
  defaultVariants: {
    level: 'h2',
  },
});

function Heading({
  className,
  level = 'h2',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> &
  Omit<VariantProps<typeof headingVariants>, 'level'> & {
    level?: HeadingLevel;
  }) {
  const Comp = level;

  return <Comp data-slot="heading" data-level={level} className={cn(headingVariants({level, className}))} {...props} />;
}

const textVariants = cva('text-base leading-7 text-foreground', {
  variants: {
    variant: {
      default: '',
      muted: 'text-muted-foreground',
      lead: 'text-lg leading-7 text-muted-foreground',
      small: 'text-sm leading-6',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Text({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'p'> & VariantProps<typeof textVariants>) {
  return <p data-slot="text" data-variant={variant} className={cn(textVariants({variant, className}))} {...props} />;
}

export {Heading, headingVariants, Text, textVariants};
