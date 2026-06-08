'use client';

import { useInView, useCountUp } from './anim';

/** A number that eases from 0 to `value` when it scrolls into view. */
export function CountUpStat({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1100,
  className = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const shown = useCountUp(value, inView, { decimals, duration });
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{shown.toFixed(decimals)}{suffix}
    </span>
  );
}
