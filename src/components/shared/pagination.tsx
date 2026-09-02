"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 select-none">
      {/* Records count indicator */}
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{startItem}</span> to{" "}
          <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{endItem}</span> of{" "}
          <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{total}</span> records
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-3">
            <span className="text-[11px]">Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-[11px]">per page</span>
          </div>
        )}
      </div>

      {/* Page navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 disabled:opacity-30"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 disabled:opacity-30"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center px-3 text-xs font-medium">
          <span>
            Page <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{page}</span> of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{totalPages}</span>
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 disabled:opacity-30"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 disabled:opacity-30"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
