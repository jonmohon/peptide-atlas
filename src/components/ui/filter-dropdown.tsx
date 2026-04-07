'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-all',
          value
            ? 'border-medical-400 bg-medical-50 text-medical-700'
            : 'border-border bg-white text-text-secondary hover:border-medical-300'
        )}
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg py-1">
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={cn(
              'w-full text-left px-3 py-2 text-sm hover:bg-surface-dim transition-colors',
              !value && 'text-medical-600 font-medium'
            )}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-surface-dim transition-colors',
                value === option.value && 'text-medical-600 font-medium bg-medical-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
