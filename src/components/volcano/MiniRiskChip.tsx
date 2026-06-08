'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useInView, useCountUp } from './anim';

export interface MiniRiskData {
  id: string;
  name: string;
  province: string;
  status: string;
  slug: string;
  alertLevel: number;
  riskLevel: string;
  p1Year: number;
  baseAnnualRate: number;
  recurrenceYears: number;
  lastEruption: string;
}

const DOT: Record<string, string> = {
  MODERATE: 'bg-lime-500',
  LOW: 'bg-green-500',
  BACKGROUND: 'bg-gray-400',
};

export function MiniRiskChip({ data, index = 0 }: { data: MiniRiskData; index?: number }) {
  const { ref, inView } = useInView<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const shown = useCountUp(data.p1Year, inView, { duration: 900, decimals: 1 });

  return (
    <button
      ref={ref}
      onClick={() => setOpen(o => !o)}
      className="text-left rounded-xl p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors w-full"
      style={{
        transition: 'opacity .5s ease, transform .5s ease, border-color .2s',
        transitionDelay: `${index * 40}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(10px)',
      }}
      aria-expanded={open}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${DOT[data.riskLevel] ?? 'bg-gray-400'}`} />
        <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{data.name}</span>
        <span className="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
          {shown.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{data.province}</p>

      {/* Mini probability bar */}
      <div className="h-1.5 mt-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-lime-500"
          style={{
            width: inView ? `${Math.min(data.p1Year * 2.5, 100)}%` : '0%',
            transition: 'width .9s cubic-bezier(.22,1,.36,1)',
            transitionDelay: `${index * 40 + 120}ms`,
          }} />
      </div>

      {/* Expand: how the baseline is built */}
      <div className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between"><span>Baseline rate</span><span className="font-mono">{data.baseAnnualRate.toFixed(3)}/yr</span></div>
            <div className="flex justify-between"><span>Avg. recurrence</span><span className="font-mono">~{data.recurrenceYears} yr</span></div>
            <div className="flex justify-between"><span>PHIVOLCS alert</span><span className="font-mono">AL{data.alertLevel}</span></div>
            <div className="flex justify-between"><span>Last eruption</span><span className="font-mono">{data.lastEruption || '—'}</span></div>
            <Link href={`/volcanoes/${data.slug}`} onClick={(e) => e.stopPropagation()}
              className="inline-block mt-1 text-indigo-600 dark:text-indigo-400 hover:underline">
              View details →
            </Link>
          </div>
        </div>
      </div>
    </button>
  );
}
