import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AdminLoadingBlock = ({ rows = 5 }) => {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/60">
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`admin-loading-${index}`} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminLoadingBlock;
