import React from 'react';

export default function SkeletonLoader({ timeElapsed }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200/80 transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
            <h3 className="text-lg font-bold text-slate-800">Minando leads no Google Maps...</h3>
          </div>
          <p className="text-sm text-slate-500">
            Nossos robôs estão emulando navegação humana para evitar bloqueios de IP.
          </p>
        </div>
        
        <div className="bg-indigo-50 text-indigo-700 font-mono font-bold px-5 py-2.5 rounded-xl text-lg border border-indigo-100/80 shadow-sm flex items-center gap-2">
          <span>⏱️</span>
          <span>{timeElapsed}s</span>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50/80 rounded-xl animate-pulse gap-4">
            <div className="space-y-2 w-full sm:w-1/3">
              <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
            <div className="h-6 bg-slate-200 rounded-full w-24"></div>
            <div className="h-9 bg-slate-200 rounded-lg w-28"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
