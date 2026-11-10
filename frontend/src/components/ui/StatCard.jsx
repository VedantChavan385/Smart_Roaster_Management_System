import React from 'react';
import Badge from './Badge';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeVariant = 'slate',
  trend, // { value: '+4%', isPositive: true }
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50 border-indigo-100',
  onClick,
  className = '',
}) {
  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={onClick}
      className={`w-full text-left bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-subtle' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {badgeText && (
              <Badge variant={badgeVariant} size="xs">
                {badgeText}
              </Badge>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtext && <span className="truncate">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold shrink-0 ml-auto ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </CardWrapper>
  );
}

