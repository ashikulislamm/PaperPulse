import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
      {/* Items Range & Page Size */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <div>
          Showing <strong className="text-[var(--text-primary)] font-mono">{startItem}</strong> to{" "}
          <strong className="text-[var(--text-primary)] font-mono">{endItem}</strong> of{" "}
          <strong className="text-[var(--text-primary)] font-mono">{totalItems}</strong> entries
        </div>
        <div className="flex items-center gap-1.5">
          <span>Show:</span>
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={pageSizeOptions.map((s) => ({ label: `${s} / page`, value: String(s) }))}
            className="h-8 py-0 px-2 text-xs w-28"
          />
        </div>
      </div>

      {/* Page Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        <div className="text-xs font-mono font-bold px-2 text-[var(--text-primary)]">
          Page {currentPage} of {Math.max(1, totalPages)}
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
