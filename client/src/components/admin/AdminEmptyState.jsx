import { Card, CardContent } from "@/components/ui/card";

const AdminEmptyState = ({ title = "No data found", description = "Try changing filters and search terms." }) => {
  return (
    <Card className="rounded-2xl border-dashed border-border/70 bg-card/50">
      <CardContent className="py-10 text-center">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AdminEmptyState;
