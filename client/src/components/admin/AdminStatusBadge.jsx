import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  suspended: "border-amber-300/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  banned: "border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  upcoming: "border-sky-300/50 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ongoing: "border-indigo-300/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  completed: "border-slate-300/50 bg-slate-500/10 text-slate-700 dark:text-slate-400",
  cancelled: "border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  verified: "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  unverified: "border-zinc-300/50 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  sent: "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  scheduled: "border-blue-300/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  draft: "border-zinc-300/50 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  failed: "border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  success: "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "border-amber-300/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "border-emerald-300/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  admin: "border-primary/30 bg-primary/10 text-primary",
  user: "border-zinc-300/50 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  event: "border-sky-300/50 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  community: "border-indigo-300/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  venue: "border-teal-300/50 bg-teal-500/10 text-teal-700 dark:text-teal-400",
  booking: "border-amber-300/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  notification: "border-fuchsia-300/50 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
  system: "border-zinc-300/50 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
};

const toLabel = (value = "") => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const AdminStatusBadge = ({ value }) => {
  const key = String(value || "").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        statusStyles[key] || "border-border bg-secondary/50 text-secondary-foreground"
      )}
    >
      {toLabel(String(value || ""))}
    </Badge>
  );
};

export default AdminStatusBadge;
