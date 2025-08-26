import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // State management
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sortBy: 'latest',
    communityId: ''
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (data) => {
      setPosts(prev => [data, ...prev]);
      toast.success('New post added!');
    };

    const handlePostUpdated = (data) => {
      setPosts(prev => prev.map(post => 
        post._id === data._id ? data : post
      ));
      if (currentPost?._id === data._id) {
        setCurrentPost(data);
      }
    };

    const handlePostDeleted = (postId) => {
      setPosts(prev => prev.filter(post => post._id !== postId));
      if (currentPost?._id === postId) {
        setCurrentPost(null);
      }
      toast.success('Post deleted');
    };

    const handlePostLiked = (data) => {
      setPosts(prev => prev.map(post => 
        post._id === data.postId ? {
          ...post,
          likesCount: data.likesCount,
          isLiked: data.isLiked
        } : post
      ));
    };

    const handleNewComment = (data) => {
      setPosts(prev => prev.map(post => 
        post._id === data.postId ? {
          ...post,
          commentsCount: post.commentsCount + 1
        } : post
      ));
      
      if (currentPost?._id === data.postId) {
        setCurrentPost(prev => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment]
        }));
      }
    };

    // Socket listeners
    socket.on('newCommunityPost', handleNewPost);
    socket.on('communityPostUpdated', handlePostUpdated);
    socket.on('communityPostDeleted', handlePostDeleted);
    socket.on('communityPostLiked', handlePostLiked);
    socket.on('newComment', handleNewComment);

    return () => {
      socket.off('newCommunityPost');
      socket.off('communityPostUpdated');
      socket.off('communityPostDeleted');
      socket.off('communityPostLiked');
      socket.off('newComment');
    };
  }, [socket, currentPost]);

  // Get community posts with filters and pagination
  const getCommunityPosts = async (newFilters = null, newPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = newFilters || filters;
      if (newFilters) {
        setFilters(newFilters);
      }

      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value);
      });

      queryParams.append('page', newPage);
      queryParams.append('limit', pagination.limit);

      const response = await api.get(`/community/posts?${queryParams}`);

      if (response.data.success) {
        if (newPage === 1) {
          setPosts(response.data.data);
        } else {
          setPosts(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch posts';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new community post
  const createCommunityPost = async (postData) => {
    setLoading(true);
    const toastId = toast.loading('Creating post...');

    try {
      const formData = new FormData();
      
      Object.entries(postData).forEach(([key, value]) => {
        if (key === 'images' && value) {
          Array.from(value).forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await api.post('/community/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setPosts(prev => [response.data.data, ...prev]);
        toast.success('Post created successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get single post by ID
  const getCommunityPostById = async (postId) => {
    setLoading(true);

    try {
      const response = await api.get(`/community/posts/${postId}`);

      if (response.data.success) {
        setCurrentPost(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch post';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update community post
  const updateCommunityPost = async (postId, updateData) => {
    setLoading(true);
    const toastId = toast.loading('Updating post...');

    try {
      const formData = new FormData();
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'images' && value) {
          Array.from(value).forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await api.put(`/community/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedPost = response.data.data;
        setPosts(prev => prev.map(post => 
          post._id === postId ? updatedPost : post
        ));
        if (currentPost?._id === postId) {
          setCurrentPost(updatedPost);
        }
        toast.success('Post updated successfully!', { id: toastId });
        return { success: true, data: updatedPost };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Delete community post
  const deleteCommunityPost = async (postId) => {
    const toastId = toast.loading('Deleting post...');

    try {
      const response = await api.delete(`/community/posts/${postId}`);

      if (response.data.success) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        if (currentPost?._id === postId) {
          setCurrentPost(null);
        }
        toast.success('Post deleted successfully!', { id: toastId });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Like/Unlike community post
  const likeCommunityPost = async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);

      if (response.data.success) {
        const { isLiked, likesCount } = response.data.data;
        
        setPosts(prev => prev.map(post => 
          post._id === postId ? {
            ...post,
            isLiked,
            likesCount
          } : post
        ));

        if (currentPost?._id === postId) {
          setCurrentPost(prev => ({
            ...prev,
            isLiked,
            likesCount
          }));
        }

        return { success: true, isLiked, likesCount };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update like';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Add comment to post
  const addCommentToPost = async (postId, content) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, {
        content
      });

      if (response.data.success) {
        const newComment = response.data.data;
        
        setPosts(prev => prev.map(post => 
          post._id === postId ? {
            ...post,
            commentsCount: post.commentsCount + 1
          } : post
        ));

        if (currentPost?._id === postId) {
          setCurrentPost(prev => ({
            ...prev,
            comments: [...(prev.comments || []), newComment],
            commentsCount: prev.commentsCount + 1
          }));
        }

        return { success: true, data: newComment };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get trending posts
  const getTrendingPosts = async (timeframe = 'week', limit = 10) => {
    setLoading(true);

    try {
      const response = await api.get(`/community/posts/trending?timeframe=${timeframe}&limit=${limit}`);

      if (response.data.success) {
        setTrendingPosts(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch trending posts';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get posts from followed communities
  const getFollowingPosts = async (page = 1, limit = 10) => {
    setLoading(true);

    try {
      const response = await api.get(`/community/posts/following/feed?page=${page}&limit=${limit}`);

      if (response.data.success) {
        if (page === 1) {
          setFollowingPosts(response.data.data);
        } else {
          setFollowingPosts(prev => [...prev, ...response.data.data]);
        }
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch following posts';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get community stats
  const getCommunityStats = async () => {
    try {
      const response = await api.get('/community/stats');

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return null;
    }
  };

  const fetchCommunity = async (communityId) => {
    try {
      const response = await api.get(`/community/${communityId}`);
      if (response.data.success) {
        setCurrentCommunity(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      return null;
    }
  }

  // Clear current post
  const clearCurrentPost = () => {
    setCurrentPost(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      sortBy: 'latest',
      communityId: ''
    });
  };

  const value = {
    // State
    posts,
    trendingPosts,
    followingPosts,
    currentPost,
    loading,
    error,
    pagination,
    filters,
    currentCommunity,
    
    // Actions
    getCommunityPosts,
    createCommunityPost,
    getCommunityPostById,
    updateCommunityPost,
    deleteCommunityPost,
    likeCommunityPost,
    addCommentToPost,
    getTrendingPosts,
    getFollowingPosts,
    getCommunityStats,
    clearCurrentPost,
    resetFilters,
    setFilters,
    fetchCommunity
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export { CommunityContext };