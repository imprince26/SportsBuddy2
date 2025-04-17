"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { User, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Shield, UserX, UserCheck, Edit, Loader2, AlertTriangle } from 'lucide-react'
import { format } from "date-fns"
import AdminLayout from "@/components/layout/AdminLayout"

const ManageUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [actionUser, setActionUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, selectedRole, selectedStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // This would be an API call in a real application
      // const response = await api.get('/admin/users', {
      //   params: {
      //     page: currentPage,
      //     role: selectedRole !== 'all' ? selectedRole : undefined,
      //     status: selectedStatus !== 'all' ? selectedStatus : undefined,
      //     search: searchTerm || undefined,
      //   }
      // });
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockUsers = Array.from({ length: 20 }, (_, i) => ({
          _id: `user_${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          username: `user${i + 1}`,
          role: i % 10 === 0 ? "admin" : "user",
          status: i % 5 === 0 ? "suspended" : "active",
          createdAt: new Date(Date.now() - Math.random() * 10000000000),
          avatar: null,
        }))
        
        setUsers(mockUsers)
        setTotalPages(5)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users. Please try again later.")
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleUserAction = (action, userId) => {
    // This would be an API call in a real application
    console.log(`${action} user with ID: ${userId}`)
    
    // Update local state for demonstration
    if (action === "suspend" || action === "activate") {
      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, status: action === "suspend" ? "suspended" : "active" } 
          : u
      ))
    } else if (action === "makeAdmin" || action === "removeAdmin") {
      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, role: action === "makeAdmin" ? "admin" : "user" } 
          : u
      ))
    }
    
    setActionUser(null)
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
            Manage Users
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-4 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
              <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Error</h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark">{error}</p>
          </div>
        ) : (
          <>
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
                    {users.map((user) => (
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
                                <User size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
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
                              onClick={() => setActionUser(actionUser === user._id ? null : user._id)}
                              className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                            >
                              <MoreHorizontal size={16} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            </button>
                            {actionUser === user._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark rounded-md shadow-lg z-10 border border-border-light dark:border-border-dark">
                                <Link
                                  to={`/profile/${user._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                                >
                                  <User size={16} className="mr-2" />
                                  View Profile
                                </Link>
                                <button
                                  onClick={() => handleUserAction(user.status === "active" ? "suspend" : "activate", user._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  {user.status === "active" ? (
                                    <>
                                      <UserX size={16} className="mr-2 text-destructive-light dark:text-destructive-dark" />
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
                                  onClick={() => handleUserAction(user.role === "user" ? "makeAdmin" : "removeAdmin", user._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  {user.role === "user" ? (
                                    <>
                                      <Shield size={16} className="mr-2 text-primary-light dark:text-primary-dark" />
                                      Make Admin
                                    </>
                                  ) : (
                                    <>
                                      <Shield size={16} className="mr-2 text-muted-foreground-light dark:text-muted-foreground-dark" />
                                      Remove Admin
                                    </>
                                  )}
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark text-left"
                                >
                                  <Edit size={16} className="mr-2" />
                                  Edit User
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * 10, users.length)}</span> of{" "}
                <span className="font-medium">{users.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === page
                        ? "bg-primary-light dark:bg-primary-dark text-white"
                        : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                      : "text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default ManageUsers
