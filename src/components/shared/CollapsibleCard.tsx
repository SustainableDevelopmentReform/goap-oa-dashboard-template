"use client";

import clsx from "clsx";
import { forwardRef } from "react";

interface CollapsibleCardProps {
  title: string;
  eyebrow?: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={clsx("h-5 w-5 transition-transform", open ? "rotate-180" : "rotate-0")}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path d="M5 7.5 10 12l5-4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CollapsibleCard = forwardRef<HTMLDivElement, CollapsibleCardProps>(function CollapsibleCard(
  { title, eyebrow, description, isOpen, onToggle, children, className, action },
  ref,
) {
  return (
    <article
      ref={ref}
      className={clsx(
        "rounded-3xl border border-slate-200 bg-white/80 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full flex-1 items-start gap-4 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex-1">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <div className="mt-1 text-slate-500">
            <ChevronIcon open={isOpen} />
          </div>
        </button>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div
        className={clsx(
          "grid overflow-hidden px-6 transition-all duration-200",
          isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">{isOpen ? children : null}</div>
      </div>
    </article>
  );
});
