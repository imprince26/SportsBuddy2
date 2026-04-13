import { create } from "zustand";

const defaultFilters = {
  users: {
    page: 1,
    limit: 20,
    search: "",
    role: "all",
    accountStatus: "all",
    sortBy: "createdAt:desc",
  },
  events: {
    page: 1,
    limit: 20,
    search: "",
    status: "all",
    category: "all",
    sortBy: "createdAt:desc",
  },
  communities: {
    page: 1,
    limit: 20,
    search: "",
    isActive: "all",
    isPrivate: "all",
  },
  venues: {
    page: 1,
    limit: 20,
    search: "",
    city: "",
    isVerified: "all",
    isActive: "all",
  },
  bookings: {
    page: 1,
    limit: 20,
    status: "all",
    venueId: "",
  },
  notifications: {
    page: 1,
    limit: 20,
    status: "all",
    type: "all",
    priority: "all",
    search: "",
  },
  auditLogs: {
    page: 1,
    limit: 20,
    entityType: "all",
    status: "all",
    action: "",
  },
};

export const useAdminUiStore = create((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  currentWorkspace: "overview",
  adminSearchOpen: false,
  growthDays: 30,
  filters: defaultFilters,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  setAdminSearchOpen: (open) => set({ adminSearchOpen: open }),

  setGrowthDays: (days) => set({ growthDays: days }),

  updateFilter: (section, values) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [section]: {
          ...state.filters[section],
          ...values,
        },
      },
    })),

  resetFilter: (section) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [section]: defaultFilters[section],
      },
    })),
}));
