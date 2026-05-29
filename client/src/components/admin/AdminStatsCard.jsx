import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AdminStatsCard = ({
  title,
  value,
  hint,
  icon: Icon,
  trend = "neutral",
  compact = false,
}) => {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card shadow-sm transition-all hover:shadow-md",
        compact ? "rounded-xl" : "rounded-2xl"
      )}
    >
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="mt-1 break-words text-[clamp(1.35rem,2vw,1.75rem)] font-bold leading-tight text-foreground">
              {value}
            </p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
              trend === "up" && "border-emerald-300/60 bg-emerald-500/10 text-emerald-600",
              trend === "down" && "border-rose-300/60 bg-rose-500/10 text-rose-600",
              trend === "neutral" && "border-primary/20 bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;
