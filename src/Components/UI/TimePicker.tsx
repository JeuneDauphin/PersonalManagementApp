import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOutsideClick } from '../../utils/hooks/hooks';

interface TimePickerProps {
  value: string; // format: HH:mm (24h)
  onChange: (value: string) => void;
  minuteStep?: number; // default 5
  className?: string;
  onClose?: () => void; // optional: parent can close popover
  // Compact inline mode renders the wheel inside the trigger square (no chrome, tighter layout)
  compact?: boolean;
  // Optional overrides (used mainly by compact):
  itemHeight?: number; // px per row item (default 36; compact ~ 24)
  visibleCount?: number; // rows visible (default 5; compact ~ 3)
  columnWidthClass?: string; // tailwind width for each column (default w-20; compact w-10)
}

// Utility to clamp
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const pad2 = (n: number) => n.toString().padStart(2, '0');

// Defaults for standard (popover-like) size
const DEFAULT_ITEM_HEIGHT = 36; // px
const DEFAULT_VISIBLE_COUNT = 5; // odd recommended

const buildMinutes = (step: number) => {
  const list: number[] = [];
  for (let m = 0; m < 60; m += step) list.push(m);
  // ensure 60 is not included; 59 may be missing when step doesn't divide 60, that's okay
  return list;
};

// useOutsideClick moved to shared hooks

const WheelColumn: React.FC<{
  values: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  itemHeight: number;
  visibleCount: number;
  widthClass: string;
}> = ({ values, selectedIndex, onSelect, ariaLabel, itemHeight, visibleCount, widthClass }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeout = useRef<number | null>(null);
  const spacerCount = Math.floor(visibleCount / 2);

  // Scroll to selected on mount/update
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isUserScrolling) return;
    const target = (selectedIndex + spacerCount) * itemHeight;
    // Use direct assignment for instant positioning (more compatible than non-standard 'instant')
    el.scrollTop = target;
  }, [selectedIndex, isUserScrolling, itemHeight, spacerCount]);

  const snapToNearest = () => {
    const el = containerRef.current;
    if (!el) return;
    const rawIndex = el.scrollTop / itemHeight - spacerCount;
    const nearest = clamp(Math.round(rawIndex), 0, values.length - 1);
    const target = (nearest + spacerCount) * itemHeight;
    el.scrollTo({ top: target, behavior: 'smooth' });
    if (nearest !== selectedIndex) onSelect(nearest);
  };

  const onScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      setIsUserScrolling(false);
      snapToNearest();
    }, 120);
  };

  const containerHeight = itemHeight * visibleCount;

  return (
    <div className={`relative ${widthClass}`} aria-label={ariaLabel} role="listbox">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory border border-gray-700 rounded-lg bg-gray-800"
        style={{ height: containerHeight, scrollBehavior: 'smooth' }}
      >
        {/* Top spacer */}
        {Array.from({ length: spacerCount }).map((_, i) => (
          <div key={`top-${i}`} style={{ height: itemHeight }} />
        ))}
        {values.map((v, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={v}
              className={`flex items-center justify-center snap-center text-sm select-none ${isSelected ? 'text-white font-semibold' : 'text-gray-300'}`}
              style={{ height: itemHeight }}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(idx)}
            >
              {pad2(v)}
            </div>
          );
        })}
        {/* Bottom spacer */}
        {Array.from({ length: spacerCount }).map((_, i) => (
          <div key={`bot-${i}`} style={{ height: itemHeight }} />
        ))}
      </div>
      {/* Selection highlight */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-y border-blue-500/40" style={{ height: itemHeight }} />
    </div>
  );
};

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, minuteStep = 5, className, onClose, compact = false, itemHeight, visibleCount, columnWidthClass }) => {
  const [hour, minute] = useMemo(() => {
    const [hh, mm] = (value || '00:00').split(':').map((n) => parseInt(n || '0', 10));
    return [clamp(hh || 0, 0, 23), clamp(mm || 0, 0, 59)] as const;
  }, [value]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapperRef, onClose);

  // Close on Escape key for accessibility
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const minutes = useMemo(() => buildMinutes(minuteStep), [minuteStep]);
  const hourValues = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minuteIndex = useMemo(() => {
    let idx = minutes.findIndex((m) => m === minute);
    if (idx === -1) {
      // find nearest
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < minutes.length; i++) {
        const diff = Math.abs(minutes[i] - minute);
        if (diff < best) { best = diff; nearest = i; }
      }
      idx = nearest;
    }
    return idx;
  }, [minute, minutes]);

  const hourIndex = hour; // values are 0..23

  const handleHourSelect = (idx: number) => {
    const h = clamp(idx, 0, 23);
    onChange(`${pad2(h)}:${pad2(minutes[minuteIndex])}`);
  };

  const handleMinuteSelect = (idx: number) => {
    const m = minutes[clamp(idx, 0, minutes.length - 1)];
    onChange(`${pad2(hourIndex)}:${pad2(m)}`);
  };

  const effItemHeight = itemHeight ?? (compact ? 24 : DEFAULT_ITEM_HEIGHT);
  const effVisibleCount = visibleCount ?? (compact ? 3 : DEFAULT_VISIBLE_COUNT);
  const effColWidth = columnWidthClass ?? (compact ? 'w-10' : 'w-20');

  const chromeClasses = compact
    ? 'p-0 bg-transparent border-none shadow-none'
    : 'p-3 bg-gray-900 border border-gray-700 shadow-xl';

  return (
    <div
      ref={wrapperRef}
      className={`relative flex items-stretch gap-2 rounded-lg ${chromeClasses} ${className || ''}`}
      role="dialog"
      aria-label="Time picker"
    >
      <WheelColumn
        values={hourValues}
        selectedIndex={hourIndex}
        onSelect={handleHourSelect}
        ariaLabel="Hours"
        itemHeight={effItemHeight}
        visibleCount={effVisibleCount}
        widthClass={effColWidth}
      />
      <div className="flex items-center justify-center text-gray-400 font-semibold select-none">:</div>
      <WheelColumn
        values={minutes}
        selectedIndex={minuteIndex}
        onSelect={handleMinuteSelect}
        ariaLabel="Minutes"
        itemHeight={effItemHeight}
        visibleCount={effVisibleCount}
        widthClass={effColWidth}
      />
    </div>
  );
};

export default TimePicker;
