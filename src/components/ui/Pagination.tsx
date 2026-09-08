import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
      <span className="text-[12px] text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground disabled:opacity-40 hover:text-foreground transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
