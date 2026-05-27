import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getPageItems = (page, totalPages) => {
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page]);
  pages.add(Math.max(1, page - 1));
  pages.add(Math.min(totalPages, page + 1));

  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sortedPages = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.reduce((items, item, index) => {
    const previous = sortedPages[index - 1];
    if (previous && item - previous > 1) {
      items.push(`ellipsis-${previous}-${item}`);
    }
    items.push(item);
    return items;
  }, []);
};

const AdminPagination = ({ pagination, onPageChange }) => {
  if (!pagination) {
    return null;
  }

  const { page = 1, limit = 20, totalPages = 1, hasNext, hasPrev, total = 0 } = pagination;
  const safeTotalPages = Math.max(1, totalPages || 1);
  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = total > 0 ? Math.min(page * limit, total) : 0;
  const pageItems = getPageItems(page, safeTotalPages);
  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === page) {
      return;
    }
    onPageChange(nextPage);
  };

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-primary/15 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Roster pages</p>
          <p className="text-xs text-muted-foreground">
            Showing {startRecord}-{endRecord} of {total} records
          </p>
        </div>
        <p className="rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-medium text-primary">
          Page {page} of {safeTotalPages}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!hasPrev}
            onClick={() => goToPage(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!hasPrev}
            onClick={() => goToPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
        </Button>

          <div className="flex items-center gap-1">
            {pageItems.map((item) =>
              typeof item === "number" ? (
                <Button
                  key={item}
                  variant={item === page ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs font-semibold",
                    item === page && "border-primary bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => goToPage(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                >
                  {item}
                </Button>
              ) : (
                <span key={item} className="flex h-8 w-7 items-center justify-center text-xs text-muted-foreground">
                  ...
                </span>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!hasNext}
            onClick={() => goToPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!hasNext}
            onClick={() => goToPage(safeTotalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
        </Button>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-secondary sm:w-40">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, (page / safeTotalPages) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPagination;
