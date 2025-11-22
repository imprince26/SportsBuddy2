import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from "@/hooks/useSocket"
import { Users, UserPlus, UserMinus, Crown, ChevronLeft, Loader2, AlertTriangle, User, MessageSquare, Settings, Shield, Check, X, Plus, Search } from 'lucide-react'

const TeamManagement = () => {
  const { eventId, teamId } = useParams()
  const { getEventById, getTeamById, updateTeam, addTeam, deleteTeam, inviteToTeam, removeFromTeam, transferCaptaincy } = useEvents()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState(null)
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [pendingInvites, setPendingInvites] = useState([])
  const [confirmAction, setConfirmAction] = useState(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const eventData = await getEventById(eventId)
        setEvent(eventData)
        
        if (teamId) {
          const teamData = await getTeamById(teamId)
          setTeam(teamData)
          setTeamName(teamData.name)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load team data. The team may not exist or you don't have permission to view it.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [eventId, teamId])
  
  useEffect(() => {
    if (socket && team) {
      // Join team room
      socket.emit("join_team", teamId)
      
      // Listen for team events
      socket.on("teamUpdated", (updatedTeam) => {
        if (updatedTeam._id === team._id) {
          setTeam(updatedTeam)
        }
      })
      
      socket.on("teamMemberJoined", (data) => {
        if (data.teamId === team._id) {
          setTeam(prev => ({
            ...prev,
            members: [...prev.members, data.user]
          }))
          
          // Remove from pending invites if applicable
          setPendingInvites(prev => prev.filter(invite => invite.userId !== data.user._id))
        }
      })
      
      socket.on("teamMemberLeft", (data) => {
        if (data.teamId === team._id) {
          setTeam(prev => ({
            ...prev,
            members: prev.members.filter(member => member._id !== data.userId)
          }))
        }
      })
      
      socket.on("captaincyTransferred", (data) => {
        if (data.teamId === team._id) {
          setTeam(prev => ({
            ...prev,
            captain: data.newCaptain
          }))
        }
      })
      
      socket.on("teamInviteSent", (data) => {
        if (data.teamId === team._id) {
          setPendingInvites(prev => [...prev, data.invite])
        }
      })
      
      return () => {
        socket.emit("leave_team", teamId)
        socket.off("teamUpdated")
        socket.off("teamMemberJoined")
        socket.off("teamMemberLeft")
        socket.off("captaincyTransferred")
        socket.off("teamInviteSent")
      }
    }
  }, [socket, team, teamId])
  
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    try {
      // This would be an API call to search users
      const results = await searchUsers(searchTerm)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }
  
  const handleInviteUser = async (userId) => {
    try {
      await inviteToTeam(teamId, userId)
      
      // Add to pending invites
      setPendingInvites(prev => [...prev, {
        userId,
        teamId,
        status: "pending",
        user: searchResults.find(user => user._id === userId)
      }])
      
      // Clear search
      setSearchTerm("")
      setSearchResults([])
    } catch (error) {
      console.error("Error inviting user:", error)
    }
  }
  
  const handleRemoveUser = async (userId) => {
    try {
      await removeFromTeam(teamId, userId)
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(member => member._id !== userId)
      }))
    } catch (error) {
      console.error("Error removing user:", error)
    }
  }
  
  const handleTransferCaptaincy = async (userId) => {
    try {
      await transferCaptaincy(teamId, userId)
      
      // Update will come through socket
    } catch (error) {
      console.error("Error transferring captaincy:", error)
    }
  }
  
  const handleUpdateTeam = async () => {
    try {
      await updateTeam(teamId, { name: teamName })
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        name: teamName
      }))
      
      setShowSettingsModal(false)
    } catch (error) {
      console.error("Error updating team:", error)
    }
  }
  
  const handleCreateTeam = async () => {
    try {
      const newTeam = await addTeam(eventId, { name: teamName })
      navigate(`/events/${eventId}/teams/${newTeam._id}`)
    } catch (error) {
      console.error("Error creating team:", error)
    }
  }
  
  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId)
      navigate(`/events/${eventId}`)
    } catch (error) {
      console.error("Error deleting team:", error)
    }
  }
  
  // Mock function for searching users - would be replaced with actual API call
  const searchUsers = async (term) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data
        const mockUsers = Array.from({ length: 5 }, (_, i) => ({
          _id: `user_${i + 1}`,
          name: `User ${i + 1}`,
          username: `user${i + 1}`,
          avatar: null
        }))
        
        resolve(mockUsers.filter(u => 
          u.name.toLowerCase().includes(term.toLowerCase()) || 
          u.username.toLowerCase().includes(term.toLowerCase())
        ))
      }, 500)
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (error || (!team && teamId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">Team Not Found</h2>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">{error}</p>
          <Link
            to={`/events/${eventId}`}
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Event
        </Link>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        {/* Team Header */}
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary-dark flex items-center justify-center text-white mr-4">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                  {team ? team.name : "Create New Team"}
                </h1>
                <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
                  {team ? `${team.members.length} members` : "For event: " + event?.name}
                </p>
              </div>
            </div>
            
            {team && (
              <div className="flex gap-2 mt-4 md:mt-0">
                {team.captain._id === user?.id && (
                  <>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                    >
                      <UserPlus size={18} />
                      <span>Invite</span>
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                )}
                <Link
                  to={`/events/${eventId}/teams/${teamId}/chat`}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted-light dark:bg-muted-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 transition-colors"
                >
                  <MessageSquare size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Team Content */}
        {team ? (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">Team Members</h2>
            
            <div className="space-y-4">
              {/* Captain */}
              <div className="bg-muted-light/30 dark:bg-muted-dark/30 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-4">
                    {team.captain.avatar ? (
                      <img
                        src={team.captain.avatar || "/placeholder.svg?height=48&width=48"}
                        alt={team.captain.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">{team.captain.name}</h3>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark flex items-center">
                        <Crown size={12} className="mr-1" />
                        Captain
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">@{team.captain.username}</p>
                  </div>
                  
                  {team.captain._id === user?.id && (
                    <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      You
                    </div>
                  )}
                </div>
              </div>
              
              {/* Other Members */}
              {team.members.filter(member => member._id !== team.captain._id).map((member) => (
                <div key={member._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-4">
                      {member.avatar ? (
                        <img
                          src={member.avatar || "/placeholder.svg?height=48&width=48"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground-light dark:text-foreground-dark">{member.name}</h3>
                      <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">@{member.username}</p>
                    </div>
                    
                    {member._id === user?.id ? (
                      <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        You
                      </div>
                    ) : team.captain._id === user?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTransferCaptaincy(member._id)}
                          className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors text-foreground-light dark:text-foreground-dark"
                          title="Make Captain"
                        >
                          <Crown size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: 'remove', userId: member._id, name: member.name })}
                          className="p-2 rounded-md hover:bg-muted-light dark:hover:bg-muted-dark transition-colors text-destructive-light dark:text-destructive-dark"
                          title="Remove from Team"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-3">Pending Invites</h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div key={invite.userId} className="bg-background-light dark:bg-background-dark rounded-lg p-3 border border-dashed border-border-light dark:border-border-dark">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                            {invite.user?.avatar ? (
                              <img
                                src={invite.user.avatar || "/placeholder.svg?height=40&width=40"}
                                alt={invite.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground-light dark:text-foreground-dark">{invite.user?.name || "User"}</h4>
                            <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">Invitation pending</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">Create a New Team</h2>
            
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  placeholder="Enter team name"
                />
              </div>
              
              <button
                onClick={handleCreateTeam}
                disabled={!teamName.trim()}
                className="w-full px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Team
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Invite to Team</h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false)
                  setSearchTerm("")
                  setSearchResults([])
                }}
                className="p-1 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search users by name or username"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  />
                </div>
              </form>
              
              {searchResults.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark flex items-center justify-center mr-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar || "/placeholder.svg?height=40&width=40"}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={20} className="text-muted-foreground-light dark:text-muted-foreground-dark" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground-light dark:text-foreground-dark">{user.name}</h4>
                          <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">@{user.username}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleInviteUser(user._id)}
                        className="p-2 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark hover:bg-primary-light/20 dark:hover:bg-primary-dark/20 transition-colors"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">No users found</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground-light dark:text-muted-foreground-dark mx-auto mb-3" />
                  <p className="text-muted-foreground-light dark:text-muted-foreground-dark">Search for users to invite</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">Team Settings</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2 rounded-md border border-input-light dark:border-input-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setConfirmAction({ type: 'delete', teamId: team._id, name: team.name })}
                  className="px-4 py-2 rounded-md text-destructive-light dark:text-destructive-dark hover:bg-destructive-light/10 dark:hover:bg-destructive-dark/10 transition-colors"
                >
                  Delete Team
                </button>
                
                <button
                  onClick={handleUpdateTeam}
                  disabled={!teamName.trim()}
                  className="px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
              {confirmAction.type === 'delete' ? 'Delete Team' : 'Remove Member'}
            </h3>
            <p className="text-foreground-light dark:text-foreground-dark mb-6">
              {confirmAction.type === 'delete' 
                ? `Are you sure you want to delete the team "${confirmAction.name}"? This action cannot be undone.`
                : `Are you sure you want to remove ${confirmAction.name} from the team?`
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-md border border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    handleDeleteTeam()
                  } else {
                    handleRemoveUser(confirmAction.userId)
                  }
                  setConfirmAction(null)
                }}
                className="px-4 py-2 rounded-md bg-destructive-light dark:bg-destructive-dark text-white hover:bg-destructive-light/90 dark:hover:bg-destructive-dark/90 transition-colors"
              >
                {confirmAction.type === 'delete' ? 'Delete' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement
