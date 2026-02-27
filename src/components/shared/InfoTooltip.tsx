"use client";

interface InfoTooltipProps {
  text?: string;
  className?: string;
}

export function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  if (!text) return null;
  return (
    <span className={`relative inline-flex ${className}`}>
      <span
        className="group inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold lowercase text-slate-500 hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f67b1]/40"
        aria-label={text}
        role="img"
        tabIndex={0}
      >
        i
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-medium normal-case text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
          {text}
        </span>
      </span>
    </span>
  );
}
