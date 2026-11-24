import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  Solved: {
    classes:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    Icon: CheckCircle2,
  },
  'In Progress': {
    classes:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    Icon: Clock,
  },
  'Not Solved': {
    classes:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    Icon: AlertCircle,
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || STATUS_STYLES['Not Solved'];
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status || 'Not Solved'}
    </span>
  );
}
