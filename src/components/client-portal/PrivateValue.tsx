import { usePrivacyMode } from '@/hooks/usePrivacyMode';
import { cn } from '@/lib/utils';

interface PrivateValueProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wraps financial/sensitive values with a blur filter when privacy mode is active.
 * Usage: <PrivateValue>CHF 5'000</PrivateValue>
 * Or inline: <PrivateValue as="span">42'300</PrivateValue>
 */
export function PrivateValue({ children, className, as: Tag = 'span' }: PrivateValueProps) {
  const { isPrivate } = usePrivacyMode();

  return (
    <Tag
      className={cn(
        'transition-[filter] duration-200 select-none',
        isPrivate && 'blur-[8px] pointer-events-none',
        className,
      )}
      aria-hidden={isPrivate}
    >
      {children}
    </Tag>
  );
}
