import React from 'react';

export default function Logo({ showText = true, size = 'md' }) {
  const dims = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className={`${dims} shrink-0 drop-shadow-sm`}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="16" className="fill-emerald-700 dark:fill-emerald-600" />
        <circle cx="32" cy="27" r="13" className="fill-red-600 dark:fill-red-500" />
        <path
          d="M17 47C21.5 41.5 26.5 39 32 39C37.5 39 42.5 41.5 47 47"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="27" r="4.8" fill="#FFFFFF" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Jonoshokti
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            People&apos;s Voice
          </span>
        </span>
      )}
    </span>
  );
}
