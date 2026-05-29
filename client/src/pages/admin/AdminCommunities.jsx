import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  Eye,
  Filter,
  Flame,
  Globe,
  ImageIcon,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminCommunities,
  useDeleteAdminCommunity,
  useUpdateAdminCommunityFeatured,
  useUpdateAdminCommunityStatus,
} from "@/hooks/admin/useAdminCommunities";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminMetricGrid from "@/components/admin/AdminMetricGrid";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const categoryOptions = ["Football", "Basketball", "Tennis", "Running", "Cycling", "Swimming", "Volleyball", "Cricket", "General", "Other"];

const safeFormat = (date, pattern = "dd MMM yyyy") => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : format(parsed, pattern);
};

const getCommunityImage = (community) => community?.primaryImage?.url || community?.image?.url || "";

const MiniStat = ({ label, value }) => (
  <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const CommunityImage = ({ community, className = "" }) => {
  const imageUrl = getCommunityImage(community);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={community?.name || "Community"}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-indigo-100 to-emerald-100 dark:from-primary/25 dark:via-slate-900 dark:to-indigo-950 ${className}`}>
      <Users className="h-10 w-10 text-primary/70" />
    </div>
  );
};

const AdminCommunities = () => {
  const { filters, updateFilter, resetFilter } = useAdminUiStore();
  const communitiesFilter = filters.communities;
  const communitiesQuery = useAdminCommunities(communitiesFilter);
  const updateStatusMutation = useUpdateAdminCommunityStatus();
  const updateFeaturedMutation = useUpdateAdminCommunityFeatured();
  const deleteMutation = useDeleteAdminCommunity();
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const stats = communitiesQuery.data?.stats || {};
  const communities = communitiesQuery.data?.data || [];
  const categories = communitiesQuery.data?.breakdowns?.categories || [];

  const metrics = useMemo(
    () => [
      {
        title: "Active groups",
        value: stats.active || 0,
        hint: `${stats.total || 0} communities in this view`,
        icon: Activity,
        trend: "up",
      },
      {
        title: "Members",
        value: (stats.totalMembers || 0).toLocaleString("en-IN"),
        hint: `${stats.totalPosts || 0} posts published`,
        icon: Users,
        trend: "neutral",
      },
      {
        title: "Join queue",
        value: stats.pendingJoinRequests || 0,
        hint: `${stats.private || 0} private communities`,
        icon: Lock,
        trend: stats.pendingJoinRequests > 0 ? "down" : "neutral",
      },
      {
        title: "Featured hubs",
        value: stats.featured || 0,
        hint: `${stats.withImages || 0} with cover images`,
        icon: Sparkles,
        trend: "up",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title="Community Moderation"
        description="Shape the health of groups, privacy gates, creator quality, and local sport conversations."
      />

      <AdminMetricGrid items={metrics} />

      <section className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-indigo-500/10 via-background to-emerald-500/10 shadow-sm">
        <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Community health studio</h3>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Healthy communities should look alive at a glance: recognizable cover images, active members, fresh posts, and join requests handled quickly.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Public" value={stats.public || 0} />
              <MiniStat label="Private" value={stats.private || 0} />
              <MiniStat label="Events" value={stats.totalEvents || 0} />
              <MiniStat label="With images" value={stats.withImages || 0} />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/80 p-3">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">Category mix</p>
            <div className="space-y-2">
              {categories.slice(0, 5).map((item) => (
                <div key={item.category} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, ((item.count || 0) / Math.max(1, stats.total || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-28 truncate text-right text-xs text-muted-foreground">
                    {item.category} ({item.count})
                  </span>
                </div>
              ))}
              {categories.length === 0 ? <p className="text-sm text-muted-foreground">No category data yet.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search community or description"
              value={communitiesFilter.search}
              onChange={(event) => updateFilter("communities", { search: event.target.value, page: 1 })}
            />
          </div>

          <Select value={communitiesFilter.isActive} onValueChange={(value) => updateFilter("communities", { isActive: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={communitiesFilter.isPrivate} onValueChange={(value) => updateFilter("communities", { isPrivate: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All privacy</SelectItem>
              <SelectItem value="true">Private</SelectItem>
              <SelectItem value="false">Public</SelectItem>
            </SelectContent>
          </Select>

          <Select value={communitiesFilter.category} onValueChange={(value) => updateFilter("communities", { category: value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sports</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => resetFilter("communities")}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {communitiesQuery.isLoading ? (
        <AdminLoadingBlock rows={7} />
      ) : communities.length ? (
        <div className="space-y-4">
          {communities.map((community) => (
            <Card key={community._id} className="overflow-hidden rounded-lg border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="grid min-h-[230px] sm:grid-cols-[230px_1fr]">
                  <div className="relative min-h-[190px]">
                    <CommunityImage community={community} />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <AdminStatusBadge value={community.isActive ? "active" : "suspended"} />
                      {community.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                    </div>
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
                      {community.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {community.isPrivate ? "Private" : "Public"}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">{community.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {community.category || "General"} - {community.location?.city || "Location not set"}
                          </p>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background px-3 py-1 text-right">
                          <p className="text-[11px] text-muted-foreground">Created</p>
                          <p className="text-sm font-semibold">{safeFormat(community.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{community.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <MiniStat label="Members" value={community.activeMemberCount || 0} />
                      <MiniStat label="Posts" value={community.postCount || 0} />
                      <MiniStat label="Events" value={community.eventCount || 0} />
                      <MiniStat label="Queue" value={community.joinRequestCount || 0} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Creator: {community.creator?.name || "Unknown"}</span>
                      <span>{community.moderatorCount || 0} moderators</span>
                      <span>{community.pinnedPostCount || 0} pinned posts</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <div className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1">
                        <span className="text-xs text-muted-foreground">Featured</span>
                        <Switch
                          checked={Boolean(community.isFeatured)}
                          onCheckedChange={(checked) => updateFeaturedMutation.mutate({ communityId: community._id, isFeatured: checked })}
                        />
                      </div>

                      <Select
                        defaultValue={String(Boolean(community.isActive))}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({
                            communityId: community._id,
                            isActive: value === "true",
                            note: value === "true" ? "Activated by admin" : "Deactivated by admin",
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[145px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="sm" onClick={() => setSelectedCommunity(community)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Details
                      </Button>

                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(community._id)} disabled={deleteMutation.isPending}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div>
            <AdminPagination pagination={communitiesQuery.data?.pagination} onPageChange={(page) => updateFilter("communities", { page })} />
          </div>
        </div>
      ) : (
        <AdminEmptyState title="No communities found" description="Try broadening your moderation, category, or privacy filter." />
      )}

      <Dialog open={Boolean(selectedCommunity)} onOpenChange={(open) => (!open ? setSelectedCommunity(null) : null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl rounded-lg p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{selectedCommunity?.name || "Community details"}</DialogTitle>
            <DialogDescription>{selectedCommunity?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 pb-6">
            {selectedCommunity ? (
              <div className="space-y-4 text-sm">
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <div className="h-56">
                    <CommunityImage community={selectedCommunity} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MiniStat label="Category" value={selectedCommunity.category || "-"} />
                  <MiniStat label="Privacy" value={selectedCommunity.isPrivate ? "Private" : "Public"} />
                  <MiniStat label="Members" value={selectedCommunity.activeMemberCount || 0} />
                  <MiniStat label="Moderators" value={selectedCommunity.moderatorCount || 0} />
                  <MiniStat label="Posts" value={selectedCommunity.postCount || 0} />
                  <MiniStat label="Events" value={selectedCommunity.eventCount || 0} />
                  <MiniStat label="Join queue" value={selectedCommunity.joinRequestCount || 0} />
                  <MiniStat label="Engagement" value={`${selectedCommunity.engagementScore || 0}%`} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Creator</p>
                    <p className="mt-1 font-medium">{selectedCommunity.creator?.name || "Unknown"}</p>
                    <p className="text-muted-foreground">{selectedCommunity.creator?.email || "No email"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Location</p>
                    <p className="mt-1 font-medium">
                      {[selectedCommunity.location?.city, selectedCommunity.location?.state].filter(Boolean).join(", ") || "-"}
                    </p>
                    <p className="text-muted-foreground">{selectedCommunity.location?.country || ""}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Posting settings</p>
                    <p className="mt-1">Member posts: {selectedCommunity.settings?.allowMemberPosts ? "Allowed" : "Blocked"}</p>
                    <p className="text-muted-foreground">Member events: {selectedCommunity.settings?.allowMemberEvents ? "Allowed" : "Blocked"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Moderation</p>
                    <p className="mt-1">{selectedCommunity.moderation?.note || "No internal note"}</p>
                    <p className="text-muted-foreground">Featured: {selectedCommunity.isFeatured ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>{selectedCommunity.postCount || 0} conversations</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Flame className="h-4 w-4 text-primary" />
                    <span>{selectedCommunity.pinnedPostCount || 0} pinned posts</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{selectedCommunity.joinRequestCount || 0} pending joins</span>
                  </div>
                </div>

                {Array.isArray(selectedCommunity.rules) && selectedCommunity.rules.length ? (
                  <div className="rounded-lg border border-border/60 bg-card p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Rules</p>
                    <div className="space-y-2">
                      {selectedCommunity.rules.map((rule, index) => (
                        <p key={`${rule}-${index}`} className="rounded-md bg-background px-3 py-2">
                          {rule}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 p-3 text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>No community rules listed yet.</span>
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommunities;
