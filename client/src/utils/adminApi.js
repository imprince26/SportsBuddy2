import api from "@/utils/api";

const withQuery = (url, params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      return;
    }
    search.set(key, String(value));
  });

  const queryString = search.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const adminApi = {
  getDashboardOverview: async () => {
    const response = await api.get("/admin/dashboard/overview");
    return response.data?.data;
  },

  getDashboardGrowth: async (days = 30) => {
    const response = await api.get(withQuery("/admin/dashboard/growth", { days }));
    return response.data?.data;
  },

  globalSearch: async (query, limit = 8) => {
    const response = await api.get(withQuery("/admin/search", { q: query, limit }));
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await api.get("/admin/system/health");
    return response.data?.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get(withQuery("/admin/users", params));
    return response.data;
  },

  updateUserRole: async ({ userId, role }) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  updateUserStatus: async ({ userId, accountStatus, reason, note }) => {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      accountStatus,
      reason,
      note,
    });
    return response.data;
  },

  getEvents: async (params = {}) => {
    const response = await api.get(withQuery("/admin/events", params));
    return response.data;
  },

  updateEventStatus: async ({ eventId, status, note }) => {
    const response = await api.patch(`/admin/events/${eventId}/status`, { status, note });
    return response.data;
  },

  updateEventFeatured: async ({ eventId, isFeatured }) => {
    const response = await api.patch(`/admin/events/${eventId}/featured`, { isFeatured });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/admin/events/${eventId}`);
    return response.data;
  },

  getCommunities: async (params = {}) => {
    const response = await api.get(withQuery("/admin/communities", params));
    return response.data;
  },

  updateCommunityStatus: async ({ communityId, isActive, note }) => {
    const response = await api.patch(`/admin/communities/${communityId}/status`, { isActive, note });
    return response.data;
  },

  updateCommunityFeatured: async ({ communityId, isFeatured }) => {
    const response = await api.patch(`/admin/communities/${communityId}/featured`, { isFeatured });
    return response.data;
  },

  deleteCommunity: async (communityId) => {
    const response = await api.delete(`/admin/communities/${communityId}`);
    return response.data;
  },

  getVenues: async (params = {}) => {
    const response = await api.get(withQuery("/admin/venues", params));
    return response.data;
  },

  updateVenueVerification: async ({ venueId, isVerified, note }) => {
    const response = await api.patch(`/admin/venues/${venueId}/verification`, { isVerified, note });
    return response.data;
  },

  updateVenueStatus: async ({ venueId, isActive, note }) => {
    const response = await api.patch(`/admin/venues/${venueId}/status`, { isActive, note });
    return response.data;
  },

  updateVenueFeatured: async ({ venueId, isFeatured }) => {
    const response = await api.patch(`/admin/venues/${venueId}/featured`, { isFeatured });
    return response.data;
  },

  getBookings: async (params = {}) => {
    const response = await api.get(withQuery("/admin/bookings", params));
    return response.data;
  },

  updateBookingStatus: async ({ venueId, bookingId, status }) => {
    const response = await api.patch(`/admin/venues/${venueId}/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  getNotifications: async (params = {}) => {
    const response = await api.get(withQuery("/admin/notifications", params));
    return response.data;
  },

  createNotification: async (payload) => {
    const response = await api.post("/admin/notifications", payload);
    return response.data;
  },

  sendNotification: async (notificationId) => {
    const response = await api.post(`/admin/notifications/${notificationId}/send`);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get(withQuery("/admin/audit-logs", params));
    return response.data;
  },
};
