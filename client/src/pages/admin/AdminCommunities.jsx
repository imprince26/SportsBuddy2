import { format } from "date-fns";
import { Trash2, Lock, Globe } from "lucide-react";
import { useAdminUiStore } from "@/store/adminUiStore";
import {
  useAdminCommunities,
  useDeleteAdminCommunity,
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

const AdminCommunities = () => {
  const { filters, updateFilter } = useAdminUiStore();
  const communitiesFilter = filters.communities;
  const communitiesQuery = useAdminCommunities(communitiesFilter);
  const updateStatusMutation = useUpdateAdminCommunityStatus();
  const deleteMutation = useDeleteAdminCommunity();

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title="Community Moderation"
        description="Curate healthy groups, privacy controls, and creator quality standards."
      />

      <Card className="rounded-2xl border-border/60 bg-card/70">
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
            <Card key={community._id} className="rounded-2xl border-border/60 bg-card/70">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{community.name}</p>
                    <p className="text-xs text-muted-foreground">{community.category || "General"}</p>
                    <p className="text-xs text-muted-foreground">
                      Created by {community.creator?.name || "Unknown"} on{" "}
                      {community.createdAt ? format(new Date(community.createdAt), "dd MMM yyyy") : "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <AdminStatusBadge value={community.isActive ? "active" : "suspended"} />
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {community.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {community.isPrivate ? "Private" : "Public"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={String(Boolean(community.isActive))}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({ communityId: community._id, isActive: value === "true" })
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
    </div>
  );
};

export default AdminCommunities;
