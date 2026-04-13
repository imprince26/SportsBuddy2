import { Button } from "@/components/ui/button";

const AdminPagination = ({ pagination, onPageChange }) => {
  if (!pagination) {
    return null;
  }

  const { page, totalPages, hasNext, hasPrev, total } = pagination;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">Total records: {total || 0}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-xs font-medium text-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminPagination;
