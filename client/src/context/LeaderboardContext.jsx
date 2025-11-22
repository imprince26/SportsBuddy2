import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // State management
  const [leaderboard, setLeaderboard] = useState([]);
  const [sportLeaderboards, setSportLeaderboards] = useState({});
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 50
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardUpdate = (data) => {
      // Update leaderboard positions
      setLeaderboard(prev => prev.map(entry =>
        entry.user._id === data.userId ? {
          ...entry,
          points: data.newPoints,
          rank: data.newRank
        } : entry
      ));

      // Show notification if it's the current user
      if (data.userId === user?.id) {
        toast.success(`Your ranking updated! New position: #${data.newRank}`);
      }
    };

    const handleNewAchievement = (data) => {
      if (data.userId === user?.id) {
        setAchievements(prev => [data.achievement, ...prev]);
        toast.success(`🏆 Achievement unlocked: ${data.achievement.title}!`);
      }
    };

    const handlePointsUpdate = (data) => {
      if (data.userId === user?.id) {
        setUserStats(prev => prev ? {
          ...prev,
          points: data.newPoints,
          level: data.newLevel
        } : null);

        if (data.pointsAdded > 0) {
          toast.success(`+${data.pointsAdded} points earned!`);
        }
      }
    };

    // Socket listeners
    socket.on('leaderboardUpdate', handleLeaderboardUpdate);
    socket.on('newAchievement', handleNewAchievement);
    socket.on('pointsUpdate', handlePointsUpdate);

    return () => {
      socket.off('leaderboardUpdate');
      socket.off('newAchievement');
      socket.off('pointsUpdate');
    };
  }, [socket, user]);

  // Get main leaderboard
  const getLeaderboard = async (timeframe = 'all', page = 1, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/leaderboard?timeframe=${timeframe}&page=${page}&limit=${limit}`);

      if (response.data.success) {
        if (page === 1) {
          setLeaderboard(response.data.data);
        } else {
          setLeaderboard(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch leaderboard';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get sport-specific leaderboard
  const getLeaderboardBySport = async (sport, timeframe = 'all', page = 1, limit = 50) => {
    setLoading(true);

    try {
      const response = await api.get(`/leaderboard/sport/${sport}?timeframe=${timeframe}&page=${page}&limit=${limit}`);

      if (response.data.success) {
        setSportLeaderboards(prev => ({
          ...prev,
          [sport]: response.data.data
        }));
        return {
          data: response.data.data,
          pagination: response.data.pagination,
          stats: response.data.stats
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch sport leaderboard';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user ranking
  const getUserRanking = async (userId, category = 'overall') => {
    setLoading(true);

    try {
      const response = await api.get(`/leaderboard/user/${userId}/ranking?category=${category}`);

      if (response.data.success) {
        setUserRanking(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user ranking';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user stats
  const getUserStats = async (userId) => {
    setLoading(true);

    try {
      const response = await api.get(`/leaderboard/user/${userId}/stats`);

      if (response.data.success) {
        setUserStats(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user stats';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get monthly leaderboard
  const getMonthlyLeaderboard = async (month = null, year = null, category = 'overall') => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      if (month) queryParams.append('month', month);
      if (year) queryParams.append('year', year);
      queryParams.append('category', category);

      const response = await api.get(`/leaderboard/monthly?${queryParams}`);

      if (response.data.success) {
        setMonthlyLeaderboard(response.data.data);
        return {
          data: response.data.data,
          period: response.data.period,
          stats: response.data.stats
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch monthly leaderboard';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get achievements
  const getAchievements = async (userId = null) => {
    setLoading(true);

    try {
      const url = userId ? `/leaderboard/achievements/${userId}` : '/leaderboard/achievements';
      const response = await api.get(url);

      if (response.data.success) {
        setAchievements(response.data.data);
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

  // Get trophies
  const getTrophies = async (userId = null) => {
    setLoading(true);

    try {
      const queryParams = userId ? `?userId=${userId}` : '';
      const response = await api.get(`/leaderboard/trophies${queryParams}`);

      if (response.data.success) {
        setTrophies(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch trophies';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get categories
  const getCategories = async () => {
    try {
      const response = await api.get('/leaderboard/categories');

      if (response.data.success) {
        setCategories(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  // Get leaderboard stats
  const getLeaderboardStats = async () => {
    try {
      const response = await api.get('/leaderboard/stats');

      if (response.data.success) {
        setLeaderboardStats(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      return null;
    }
  };

  // Update user score (admin only)
  const updateUserScore = async (userId, points, category = 'overall', reason = '') => {
    const toastId = toast.loading('Updating score...');

    try {
      const response = await api.post(`/leaderboard/user/${userId}/score`, {
        points,
        category,
        reason
      });

      if (response.data.success) {
        // Update local state
        if (userId === user?.id) {
          setUserStats(prev => prev ? {
            ...prev,
            points: response.data.data.newPoints
          } : null);
        }

        toast.success('Score updated successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update score';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Get user position in leaderboard
  const getUserPosition = (userId, leaderboardData = leaderboard) => {
    const userEntry = leaderboardData.find(entry => entry.user._id === userId);
    return userEntry ? userEntry.rank : null;
  };

  // Get nearby competitors
  const getNearbyCompetitors = (userId, range = 3, leaderboardData = leaderboard) => {
    const userIndex = leaderboardData.findIndex(entry => entry.user._id === userId);
    if (userIndex === -1) return [];

    const start = Math.max(0, userIndex - range);
    const end = Math.min(leaderboardData.length, userIndex + range + 1);

    return leaderboardData.slice(start, end);
  };

  // Clear leaderboard data
  const clearLeaderboardData = () => {
    setLeaderboard([]);
    setSportLeaderboards({});
    setMonthlyLeaderboard([]);
    setUserRanking(null);
    setUserStats(null);
  };

  const value = {
    // State
    leaderboard,
    sportLeaderboards,
    monthlyLeaderboard,
    userRanking,
    userStats,
    achievements,
    trophies,
    categories,
    leaderboardStats,
    loading,
    error,
    pagination,
    currentUserPosition: userRanking,

    // Actions
    getLeaderboard,
    getLeaderboardBySport,
    getUserRanking,
    getUserStats,
    getMonthlyLeaderboard,
    getAchievements,
    getTrophies,
    getCategories,
    getLeaderboardStats,
    updateUserScore,
    getUserPosition,
    getNearbyCompetitors,
    clearLeaderboardData
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export { LeaderboardContext };
