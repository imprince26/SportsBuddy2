import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Lock, Globe, Eye } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminCommunities,
  useDeleteAdminCommunity,
  useUpdateAdminCommunityFeatured,
  useUpdateAdminCommunityStatus,
} from "@/hooks/admin/useAdminCommunities";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";
import AdminLoadingBlock from "@/components/admin/AdminLoadingBlock";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminPagination from "@/components/admin/AdminPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminCommunities = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const communitiesFilter = filters.communities;
  const communitiesQuery = useAdminCommunities(communitiesFilter);
  const updateStatusMutation = useUpdateAdminCommunityStatus();
  const updateFeaturedMutation = useUpdateAdminCommunityFeatured();
  const deleteMutation = useDeleteAdminCommunity();
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Community Moderation"
        description="Curate healthy groups, privacy controls, and creator quality standards."
      />

      <Card className="rounded-2xl border-border/60 bg-card">
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
          <Input
            placeholder="Search community"
            value={communitiesFilter.search}
            onChange={(event) => updateFilter("communities", { search: event.target.value, page: 1 })}
          />

          <Select
            value={communitiesFilter.isActive}
            onValueChange={(value) => updateFilter("communities", { isActive: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={communitiesFilter.isPrivate}
            onValueChange={(value) => updateFilter("communities", { isPrivate: value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Private</SelectItem>
              <SelectItem value="false">Public</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => updateFilter("communities", { search: "", page: 1 })}>
            Reset
          </Button>
        </CardContent>
      </Card>

      {communitiesQuery.isLoading ? (
        <AdminLoadingBlock rows={6} />
      ) : communitiesQuery.data?.data?.length ? (
        <div className="space-y-3">
          {communitiesQuery.data.data.map((community) => (
            <Card key={community._id} className="rounded-2xl border-border/60 bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{community.name}</p>
                    <p className="text-xs text-muted-foreground">{community.category || "General"}</p>
                    <p className="text-xs text-muted-foreground">
                      Created by {community.creator?.name || "Unknown"} on{" "}
                      {community.createdAt ? format(new Date(community.createdAt), "dd MMM yyyy") : "-"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Members: {community.activeMemberCount || 0}</span>
                      <span>Posts: {community.postCount || 0}</span>
                      <span>Events: {community.eventCount || 0}</span>
                      <span>Pending joins: {community.joinRequestCount || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={community.isActive ? "active" : "suspended"} />
                    {community.isFeatured ? <AdminStatusBadge value="featured" /> : null}
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {community.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {community.isPrivate ? "Private" : "Public"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 px-2 py-1">
                    <span className="text-xs text-muted-foreground">Featured</span>
                    <Switch
                      checked={Boolean(community.isFeatured)}
                      onCheckedChange={(checked) =>
                        updateFeaturedMutation.mutate({ communityId: community._id, isFeatured: checked })
                      }
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
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm" variant="outline" onClick={() => setSelectedCommunity(community)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View details
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(community._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <AdminPagination
            pagination={communitiesQuery.data?.pagination}
            onPageChange={(page) => updateFilter("communities", { page })}
          />
        </div>
      ) : (
        <AdminEmptyState title="No communities found" description="Try broadening your moderation filter." />
      )}

      <Dialog
        open={Boolean(selectedCommunity)}
        onOpenChange={(open) => (!open ? setSelectedCommunity(null) : null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCommunity?.name || "Community details"}</DialogTitle>
            <DialogDescription>{selectedCommunity?.description || "No description provided"}</DialogDescription>
          </DialogHeader>

          {selectedCommunity ? (
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{selectedCommunity.category || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{selectedCommunity.location?.city || "-"}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="font-medium">{selectedCommunity.activeMemberCount || 0}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-3">
                <p className="text-xs text-muted-foreground">Pending join requests</p>
                <p className="font-medium">{selectedCommunity.joinRequestCount || 0}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommunities;
