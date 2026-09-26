import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium tracking-tight ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}
