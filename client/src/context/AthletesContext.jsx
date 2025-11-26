import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

const AthletesContext = createContext();

export const AthletesProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // State management
  const [athletes, setAthletes] = useState([]);
  const [topAthletes, setTopAthletes] = useState([]);
  const [currentAthlete, setCurrentAthlete] = useState(null);
  const [athleteAchievements, setAthleteAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12
  });
  const [filters, setFilters] = useState({
    search: '',
    sport: 'all',
    skillLevel: 'all',
    location: '',
    sortBy: 'joinedDate:desc'
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleAthleteUpdate = (data) => {
      setAthletes(prev => prev.map(athlete =>
        athlete._id === data._id ? data : athlete
      ));
      if (currentAthlete?._id === data._id) {
        setCurrentAthlete(data);
      }
    };

    const handleNewAchievement = (data) => {
      if (data.userId === user?.id) {
        toast.success(`New achievement unlocked: ${data.title}!`);
      }

      if (currentAthlete?._id === data.userId) {
        setAthleteAchievements(prev => [data, ...prev]);
      }
    };

    const handleFollowUpdate = (data) => {
      setAthletes(prev => prev.map(athlete =>
        athlete._id === data.userId ? {
          ...athlete,
          followersCount: data.followersCount,
          isFollowing: data.isFollowing
        } : athlete
      ));
    };

    // Socket listeners
    socket.on('athleteUpdated', handleAthleteUpdate);
    socket.on('newAchievement', handleNewAchievement);
    socket.on('followUpdate', handleFollowUpdate);

    return () => {
      socket.off('athleteUpdated');
      socket.off('newAchievement');
      socket.off('followUpdate');
    };
  }, [socket, currentAthlete, user]);

  // Get all athletes with filters and pagination
  const getAllAthletes = async (newFilters = null, newPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = newFilters || filters;
      if (newFilters) {
        setFilters(newFilters);
      }

      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          queryParams.append(key, value);
        }
      });

      queryParams.append('page', newPage);
      queryParams.append('limit', pagination.limit);

      const response = await api.get(`/athletes?${queryParams}`);

      if (response.data.success) {
        if (newPage === 1) {
          setAthletes(response.data.data);
        } else {
          setAthletes(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch athletes';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single athlete by ID
  const getAthleteById = async (athleteId) => {
    setLoading(true);

    try {
      const response = await api.get(`/athletes/${athleteId}`);

      if (response.data.success) {
        setCurrentAthlete(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch athlete';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get top athletes
  const getTopAthletes = async (limit = 10, category = 'overall') => {
    setLoading(true);

    try {
      const response = await api.get(`/athletes/top?limit=${limit}&category=${category}`);

      if (response.data.success) {
        setTopAthletes(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch top athletes';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search athletes
  const searchAthletes = async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
      toast.error('Search query must be at least 2 characters');
      return [];
    }

    setLoading(true);

    try {
      const response = await api.get(`/athletes/search?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search athletes';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get athlete achievements
  const getAthleteAchievements = async (athleteId) => {
    setLoading(true);

    try {
      const response = await api.get(`/athletes/${athleteId}/achievements`);

      if (response.data.success) {
        setAthleteAchievements(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch achievements';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow athlete
  const toggleFollowAthlete = async (athleteId) => {
    const previousAthletes = [...athletes];
    const previousCurrentAthlete = currentAthlete ? { ...currentAthlete } : null;

    // Find the athlete and current follow status
    const athlete = athletes.find(a => a._id === athleteId);
    const isCurrentlyFollowing = athlete?.followers?.includes(user?.id);

    // Apply optimistic update
    setAthletes(prev => prev.map(a => {
      if (a._id === athleteId) {
        let newFollowers = [...(a.followers || [])];
        if (isCurrentlyFollowing) {
          newFollowers = newFollowers.filter(id => id !== user.id);
        } else {
          if (user?.id) newFollowers.push(user.id);
        }
        return {
          ...a,
          followers: newFollowers,
          followersCount: newFollowers.length,
          isFollowing: !isCurrentlyFollowing
        };
      }
      return a;
    }));

    if (currentAthlete?._id === athleteId) {
      setCurrentAthlete(prev => {
        let newFollowers = [...(prev.followers || [])];
        if (isCurrentlyFollowing) {
          newFollowers = newFollowers.filter(id => id !== user.id);
        } else {
          if (user?.id) newFollowers.push(user.id);
        }
        return {
          ...prev,
          followers: newFollowers,
          followersCount: newFollowers.length,
          isFollowing: !isCurrentlyFollowing
        };
      });
    }

    try {
      const response = await api.post(`/athletes/${athleteId}/follow`);

      if (response.data.success) {
        const { isFollowing, followersCount } = response.data.data;

        toast.success(isFollowing ? 'Athlete followed!' : 'Athlete unfollowed!');
        return { success: true, isFollowing, followersCount };
      }
    } catch (error) {
      // Revert on error
      setAthletes(previousAthletes);
      if (previousCurrentAthlete) setCurrentAthlete(previousCurrentAthlete);

      const message = error.response?.data?.message || 'Failed to update follow status';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get athletes by sport
  const getAthletesBySport = async (sport, page = 1, limit = 12) => {
    setLoading(true);

    try {
      const response = await api.get(`/athletes?sport=${sport}&page=${page}&limit=${limit}`);

      if (response.data.success) {
        return {
          athletes: response.data.data,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch athletes by sport';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get athlete statistics
  const getAthleteStats = async (athleteId) => {
    try {
      const response = await api.get(`/athletes/${athleteId}/stats`);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      return null;
    }
  };

  // Get similar athletes (based on sports preferences)
  const getSimilarAthletes = async (athleteId, limit = 5) => {
    try {
      const response = await api.get(`/athletes/${athleteId}/similar?limit=${limit}`);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching similar athletes:', error);
      return [];
    }
  };

  // Clear current athlete
  const clearCurrentAthlete = () => {
    setCurrentAthlete(null);
    setAthleteAchievements([]);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      sport: 'all',
      skillLevel: 'all',
      location: '',
      sortBy: 'joinedDate:desc'
    });
  };

  const value = {
    // State
    athletes,
    topAthletes,
    currentAthlete,
    athleteAchievements,
    loading,
    error,
    pagination,
    filters,

    // Actions
    getAllAthletes,
    getAthleteById,
    getTopAthletes,
    searchAthletes,
    getAthleteAchievements,
    toggleFollowAthlete,
    getAthletesBySport,
    getAthleteStats,
    getSimilarAthletes,
    clearCurrentAthlete,
    resetFilters,
    setFilters
  };

  return (
    <AthletesContext.Provider value={value}>
      {children}
    </AthletesContext.Provider>
  );
};

export { AthletesContext };