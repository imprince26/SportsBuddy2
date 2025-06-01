"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from '@/hooks/useAuth';
import { SearchIcon, Filter, User, Calendar, Users, Shield, ChevronDown, X, Loader2, MoreHorizontal, CheckCircle2, AlertTriangle, UserCheck, UserX, Edit, Trash2, Eye, ArrowUpDown, CalendarDays } from 'lucide-react'
import { format } from "date-fns"
import AdminLayout from "@/components/layout/AdminLayout"

const AdminSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, searchUsers, searchEvents, updateUserStatus, updateUserRole, deleteUser, deleteEvent } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [searchType, setSearchType] = useState(searchParams.get("type") || "users")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ users: [], events: [] })
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "createdAt:desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [actionItem, setActionItem] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  
  const [filters, setFilters] = useState({
    role: searchParams.get("role") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  })
  
  const searchInputRef = useRef(null)
  const sortRef = useRef(null)
  
  // Check admin access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard")
    }
  }, [user, navigate])
  
  // Handle outside clicks for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])
  
  // Perform search when params change
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm && !Object.values(filters).some(val => val)) return
      
      setLoading(true)
      try {
        if (searchType === "users") {
          const response = await searchUsers({
            search: searchTerm,
            role: filters.role,
            status: filters.status,
            sortBy,
            page: currentPage,
          })
          
          setResults({ ...results, users: response.data })
          setTotalResults(response.pagination.total)
          setTotalPages(response.pagination.pages)
        } else {
          const response = await searchEvents({
            search: searchTerm,
            category: filters.category,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sortBy,
            page: currentPage,
          })
          
          setResults({ ...results, events: response.data })
          setTotalResults(response.pagination.total)
          setTotalPages(response.pagination.pages)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }
    
    performSearch()
  }, [searchParams])
  
  const handleSearch = (e) => {
    e.preventDefault()
    
    // Update URL params
    const params = new URLSearchParams()
    params.set("q", searchTerm)
    params.set("type", searchType)
    params.set("page", "1") // Reset to first page on new search
    
    if (filters.role) params.set("role", filters.role)
    if (filters.status) params.set("status", filters.status)
    if (filters.category) params.set("category", filters.category)
    if (filters.startDate) params.set("startDate", filters.startDate)
    if (filters.endDate) params.set("endDate", filters.endDate)
    if (sortBy) params.set("sort", sortBy)
    
    setSearchParams(params)
    setCurrentPage(1)
  }
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }
  
  const clearFilters = () => {
    setFilters({
      role: "",
      status: "",
      category: "",
      startDate: "",
      endDate: "",
    })
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    setSearchParams(params)
  }
  
  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortOptions(false)
    
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    setSearchParams(params)
  }
  
  const getSortLabel = () => {
    switch (sortBy) {
      case "createdAt:desc":
        return "Newest First"
      case "createdAt:asc":
        return "Oldest First"
      case "name:asc":
        return "Name (A-Z)"
      case "name:desc":
        return "Name (Z-A)"
      default:
        return "Sort By"
    }
  }
  
  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case "suspend":
          await updateUserStatus(userId, "suspended")
          break
        case "activate":
          await updateUserStatus(userId, "active")
          break
        case "makeAdmin":
          await updateUserRole(userId, "admin")
          break
        case "removeAdmin":
          await updateUserRole(userId, "user")
          break
        case "delete":
          setConfirmAction({ type: "user", id: userId })
          return
        default:
          return
      }
      
      // Update local state
      setResults(prev => ({
        ...prev,
        users: prev.users.map(u => {
          if (u._id === userId) {
            if (action === "suspend") return { ...u, status: "suspended" }
            if (action === "activate") return { ...u, status: "active" }
            if (action === "makeAdmin") return { ...u, role: "admin" }
            if (action === "removeAdmin") return { ...u, role: "user" }
          }
          return u
        })
      }))
      
      setActionItem(null)
    } catch (error) {
      console.error(`Error performing action ${action}:`, error)
    }
  }
  
  const handleEventAction = async (action, eventId) => {
    try {
      switch (action) {
        case "delete":
          setConfirmAction({ type: "event", id: eventId })
          return
        default:
          return
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error)
    }
  }
  
  const confirmDelete = async () => {
    try {
      if (confirmAction.type === "user") {
        await deleteUser(confirmAction.id)
        setResults(prev => ({
          ...prev,
          users: prev.users.filter(u => u._id !== confirmAction.id)
        }))
      } else if (confirmAction.type === "event") {
        await deleteEvent(confirmAction.id)
        setResults(prev => ({
          ...prev,
          events: prev.events.filter(e => e._id !== confirmAction.id)
        }))
      }
      setConfirmAction(null)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }
  
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Access Denied</h2>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
            You don't have permission to access this page.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4 md:mb-0">
            Admin Search
          </h1>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users, events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-foreground-light dark:hover:text-foreground-dark"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <div className="flex rounded-md overflow-hidden border border-input-light dark:border-input-dark">
                <button
                  type="button"
                  onClick={() => setSearchType("users")}
                  className={`px-4 py-2 ${
                    searchType === "users"
                      ? "bg-primary-light dark:bg-primary-dark text-white"
                      : "bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  }`}
                >
                  Users
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType("events")}
                  className={`px-4 py-2 ${
                    searchType === "events"
                      ? "bg-primary-light dark:bg-primary-dark text-white"
                      : "bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  }`}
                >
                  Events
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
              >
                <SearchIcon size={18} />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Filters</h3>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              {searchType === "users" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    >
                      <option value="">All Categories</option>
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Running">Running</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Swimming">Swimming</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
        
        {/* Results Header */}
        {(searchTerm || Object.values(filters).some(val => val)) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
                {loading ? "Searching..." : `${totalResults} results found`}
              </h2>
              <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                {searchType === "users" ? "Users" : "Events"} matching your search
              </p>
            </div>
            
            <div className="mt-2 sm:mt-0 relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
              >
                <ArrowUpDown size={16} />
                <span>{getSortLabel()}</span>
                <ChevronDown size={16} className={`transition-transform ${showSortOptions ? "rotate-180" : ""}`} />
              </button>
              
              {showSortOptions && (
                <div className="absolute right-0 mt-1 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleSortChange("createdAt:desc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "createdAt:desc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "createdAt:desc" ? "ml-6" : "ml-0"}>Newest First</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("createdAt:asc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "createdAt:asc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "createdAt:asc" ? "ml-6" : "ml-0"}>Oldest First</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("name:asc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "name:asc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "name:asc" ? "ml-6" : "ml-0"}>Name (A-Z)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSortChange("name:desc")}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    >
                      {sortBy === "name:desc" && <CheckCircle2 size={16} className="mr-2 text-primary-light dark:text-primary-dark" />}
                      <span className={sortBy === "name:desc" ? "ml-6" : "ml-0"}>Name (Z-A)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
              <p className="mt-4 text-foreground-light dark:text-foreground-dark">Searching...</p>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && totalResults === 0 && (searchTerm || Object.values(filters).some(val => val)) && (
          <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-lg">
            <SearchIcon className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md mx-auto">
              We couldn't find any {searchType} matching your search criteria. Try adjusting your filters or search term.
            </p>
          </div>
        )}
        
        {/* Results - Users */}
        {!loading && searchType === "users" && results.users.length > 0 && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted-light dark:bg-muted-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {results.users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User
                                size={16}
                                className="text-muted-foreground-light dark:text-muted-foreground-dark"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground-light dark:text-foreground-dark">
                              {user.name}
                            </div>
                            <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "admin"
                              ? "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark"
                              : "bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.status === "active"
                              ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark"
                              : "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setActionItem(actionItem === user._id ? null : user._id)}
                            className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                          >
                            <MoreHorizontal
                              size={16}
                              className="text-muted-foreground-light dark:text-muted-foreground-dark"
                            />
                          </button>
                          {actionItem === user._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                              <Link
                                to={`/profile/${user._id}`}
                                className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                              >
                                <Eye size={16} className="mr-2" />
                                View Profile
                              </Link>
                              <button
                                onClick={() =>
                                  handleUserAction(user.status === "active" ? "suspend" : "activate", user._id)
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                              >
                                {user.status === "active" ? (
                                  <>
                                    <UserX
                                      size={16}
                                      className="mr-2 text-destructive-light dark:text-destructive-dark"
                                    />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={16} className="mr-2 text-success-light dark:text-success-dark" />
                                    Activate User
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleUserAction(user.role === "user" ? "makeAdmin" : "removeAdmin", user._id)
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                              >
                                {user.role === "user" ? (
                                  <>
                                    <Shield size={16} className="mr-2 text-primary-light dark:text-primary-dark" />
                                    Make Admin
                                  </>
                                ) : (
                                  <>
                                    <Shield
                                      size={16}
                                      className="mr-2 text-muted-foreground-light dark:text-muted-foreground-dark"
                                    />
                                    Remove Admin
                                  </>
                                )}
                              </button>
                              <Link
                                to={`/admin/users/edit/${user._id}`}
                                className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit User
                              </Link>
                              <button
                                onClick={() => handleUserAction("delete", user._id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Results - Events */}
        {!loading && searchType === "events" && results.events.length > 0 && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted-light dark:bg-muted-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {results.events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-muted-light/50 dark:hover:bg-muted-dark/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                            {event.images && event.images.length > 0 ? (
                              <img
                                src={event.images[0].url || "/placeholder.svg"}
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <CalendarDays
                                size={16}
                                className="text-muted-foreground-light dark:text-muted-foreground-dark"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground-light dark:text-foreground-dark">
                              {event.name}
                            </div>
                            <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                              Created by {event.createdBy?.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                        {event.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                        {format(new Date(event.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                        {event.location.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            event.status === "Upcoming" ? "bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark" : 
                            event.status === "Ongoing" ? "bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark" :
                            event.status === "Completed" ? "bg-muted-light/20 dark:bg-muted-dark/20 text-foreground-light dark:text-foreground-dark" :
                            "bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-foreground-light dark:text-foreground-dark">
                        {event.participants?.length || 0}/{event.maxParticipants || "∞"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setActionItem(actionItem === event._id ? null : event._id)}
                            className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                          >
                            <MoreHorizontal
                              size={16}
                              className="text-muted-foreground-light dark:text-muted-foreground-dark"
                            />
                          </button>
                          {actionItem === event._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                              <Link
                                to={`/events/${event._id}`}
                                className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                              >
                                <Eye size={16} className="mr-2" />
                                View Event
                              </Link>
                              <Link
                                to={`/admin/events/edit/${event._id}`}
                                className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit Event
                              </Link>
                              <button
                                onClick={() => handleEventAction("delete", event._id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-destructive-light dark:text-destructive-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete Event
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                    : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                Confirm Delete
              </h3>
              <p className="text-foreground-light dark:text-foreground-dark mb-6">
                Are you sure you want to delete this {confirmAction.type}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminSearch
