import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </div>
  );
}
