import React from 'react';

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-5',
  headerClassName = 'px-5 py-4 border-b border-slate-100',
  footer,
  footerClassName = 'px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl',
  ...props
}) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:shadow-subtle transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
}

