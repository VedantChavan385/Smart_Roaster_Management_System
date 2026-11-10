import React from 'react';

export default function LoadingState({
  title = 'Loading data...',
  message = 'Retrieving information from Smart Roster Engine.',
  className = 'py-16',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="relative mb-4">
        <div className="h-10 w-10 rounded-full border-3 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {message && <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>}
    </div>
  );
}
