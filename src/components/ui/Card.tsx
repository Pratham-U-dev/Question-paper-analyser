import React from 'react';
import { cn } from '@/src/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', ...style }}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(className)}
      style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0, ...style }}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div ref={ref} className={cn(className)} style={{ padding: '18px 20px', ...style }} {...props} />
  )
);
CardContent.displayName = 'CardContent';
