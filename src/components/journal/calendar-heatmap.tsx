'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarDay } from '@/types/journal';

interface CalendarHeatmapProps {
  days: CalendarDay[];
  month: string; // YYYY-MM
  onDayClick: (date: string) => void;
  onMonthChange: (month: string) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarHeatmap({ days, month, onDayClick, onMonthChange }: CalendarHeatmapProps) {
  const today = new Date().toISOString().split('T')[0];

  const { year, monthNum, daysInMonth, startDayOfWeek, monthLabel } = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    return {
      year: y,
      monthNum: m,
      daysInMonth: lastDay.getDate(),
      startDayOfWeek: firstDay.getDay(),
      monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [month]);

  const dayStatusMap = useMemo(() => {
    const map = new Map<string, CalendarDay['status']>();
    days.forEach((d) => map.set(d.date, d.status));
    return map;
  }, [days]);

  const prevMonth = () => {
    const d = new Date(year, monthNum - 2, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const d = new Date(year, monthNum, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const cells = [];
  // Empty cells for offset
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const status = dayStatusMap.get(dateStr) ?? 'empty';
    const isToday = dateStr === today;
    const isFuture = dateStr > today;

    cells.push(
      <button
        key={dateStr}
        onClick={() => !isFuture && onDayClick(dateStr)}
        disabled={isFuture}
        className={cn(
          'aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all',
          isFuture && 'opacity-20 cursor-default',
          !isFuture && 'hover:ring-1 hover:ring-neon-cyan/40 cursor-pointer',
          isToday && 'ring-1 ring-neon-cyan/60',
          status === 'logged' && 'bg-neon-green/20 text-neon-green',
          status === 'partial' && 'bg-neon-cyan/15 text-neon-cyan',
          status === 'empty' && !isFuture && 'bg-white/[0.03] text-text-secondary',
          status === 'empty' && isFuture && 'bg-transparent text-text-secondary',
        )}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/[0.05] text-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white/[0.05] text-text-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] text-text-secondary font-medium py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
          <div className="w-3 h-3 rounded bg-neon-green/20" /> Logged
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
          <div className="w-3 h-3 rounded bg-neon-cyan/15" /> Partial
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
          <div className="w-3 h-3 rounded bg-white/[0.03]" /> Missed
        </div>
      </div>
    </div>
  );
}
