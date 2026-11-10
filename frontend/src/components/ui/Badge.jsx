import React from 'react';

const VARIANTS = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
  red: 'bg-rose-50 text-rose-700 border-rose-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
};

const DOT_COLORS = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  red: 'bg-rose-500',
  slate: 'bg-slate-400',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

export default function Badge({
  children,
  variant = 'slate',
  size = 'sm',
  withDot = false,
  className = '',
  icon: Icon,
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.slate;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.slate;

  const sizeClass = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }[size] || 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md shrink-0 whitespace-nowrap ${variantClass} ${sizeClass} ${className}`}
    >
      {withDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
