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
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12
  });
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sortBy: 'members:desc',
    location: ''
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
  };

  // Get all communities with filters
  const getCommunities = async (newFilters = null, page = 1) => {
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

      queryParams.append('page', page);
      queryParams.append('limit', pagination.limit || 12);

      const response = await api.get(`/community?${queryParams}`);

      if (response.data.success) {
        setCommunities(response.data.data);
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch communities';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get user's communities
  const getMyCommunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/community/my-communities');

      if (response.data.success) {
        setMyCommunities(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your communities';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create new community
  const createCommunity = async (communityData) => {
    setLoading(true);
    const toastId = toast.loading('Creating community...');

    try {
      const formData = new FormData();

      Object.entries(communityData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'rules' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'location' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'settings' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.post('/community', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Community created successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      console.error('Create community error:', error.response?.data);
      const message = error.response?.data?.errors
        ? error.response.data.errors.join(', ')
        : error.response?.data?.message || 'Failed to create community';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update community
  const updateCommunity = async (communityId, updateData) => {
    setLoading(true);
    const toastId = toast.loading('Updating community...');

    try {
      const formData = new FormData();

      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'removeImage') {
          formData.append('removeImage', value);
        } else if (key === 'rules' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'location' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'settings' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.put(`/community/${communityId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updated = response.data.data;
        setCommunities(prev => prev.map(c => c._id === communityId ? updated : c));
        setMyCommunities(prev => prev.map(c => c._id === communityId ? updated : c));
        if (currentCommunity?._id === communityId) {
          setCurrentCommunity(updated);
        }
        toast.success('Community updated successfully!', { id: toastId });
        return { success: true, data: updated };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update community';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Join community
  const joinCommunity = async (communityId) => {
    const toastId = toast.loading('Joining community...');

    try {
      const response = await api.post(`/community/${communityId}/join`);

      if (response.data.success) {
        toast.success(response.data.message || 'Successfully joined community!', { id: toastId });
        // Refresh communities to update join status
        getMyCommunities();
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join community';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Leave community
  const leaveCommunity = async (communityId) => {
    const toastId = toast.loading('Leaving community...');

    try {
      const response = await api.post(`/community/${communityId}/leave`);

      if (response.data.success) {
        toast.success('Successfully left community!', { id: toastId });
        setMyCommunities(prev => prev.filter(c => c._id !== communityId));
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave community';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Delete community
  const deleteCommunity = async (communityId) => {
    const toastId = toast.loading('Deleting community...');

    try {
      const response = await api.delete(`/community/${communityId}`, {
        data: { confirmDelete: true }
      });

      if (response.data.success) {
        toast.success('Community deleted successfully!', { id: toastId });
        setCommunities(prev => prev.filter(c => c._id !== communityId));
        setMyCommunities(prev => prev.filter(c => c._id !== communityId));
        if (currentCommunity?._id === communityId) {
          setCurrentCommunity(null);
        }
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete community';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

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

  // Increment post view
  const incrementPostView = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/view`);
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  // Share post
  const sharePost = async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/share`);
      return response.data;
    } catch (error) {
      console.error('Error sharing post:', error);
      return null;
    }
  };

  // Like comment
  const likeComment = async (postId, commentId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to like comment';
      toast.error(message);
      return null;
    }
  };

  // Reply to comment
  const replyToComment = async (postId, commentId, content) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments/${commentId}/replies`, {
        content
      });

      if (response.data.success) {
        toast.success('Reply added successfully!');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add reply';
      toast.error(message);
      return null;
    }
  };

  // Like reply
  const likeReply = async (postId, commentId, replyId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to like reply';
      toast.error(message);
      return null;
    }
  };

  // Update comment
  const updateCommentContent = async (postId, commentId, content) => {
    try {
      const response = await api.put(`/community/posts/${postId}/comments/${commentId}`, {
        content
      });

      if (response.data.success) {
        toast.success('Comment updated successfully');
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update comment';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete comment
  const deleteCommentContent = async (postId, commentId) => {
    try {
      const response = await api.delete(`/community/posts/${postId}/comments/${commentId}`);

      if (response.data.success) {
        toast.success('Comment deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update reply
  const updateReplyContent = async (postId, commentId, replyId, content) => {
    try {
      const response = await api.put(`/community/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
        content
      });

      if (response.data.success) {
        toast.success('Reply updated successfully');
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update reply';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete reply
  const deleteReplyContent = async (postId, commentId, replyId) => {
    try {
      const response = await api.delete(`/community/posts/${postId}/comments/${commentId}/replies/${replyId}`);

      if (response.data.success) {
        toast.success('Reply deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete reply';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get join requests for a community
  const getJoinRequests = async (communityId) => {
    try {
      const response = await api.get(`/community/${communityId}/join-requests`);
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch join requests';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Handle join request (approve/reject)
  const handleJoinRequest = async (communityId, requestId, action) => {
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} request...`);

    try {
      const response = await api.post(`/community/${communityId}/join-requests/${requestId}`, {
        action
      });

      if (response.data.success) {
        toast.success(response.data.message, { id: toastId });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process request';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Update member role
  const updateMemberRole = async (communityId, memberId, role) => {
    const toastId = toast.loading('Updating member role...');

    try {
      const response = await api.put(`/community/${communityId}/members/${memberId}/role`, {
        role
      });

      if (response.data.success) {
        toast.success(response.data.message, { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update member role';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Remove member from community
  const removeMemberFromCommunity = async (communityId, memberId) => {
    const toastId = toast.loading('Removing member...');

    try {
      const response = await api.delete(`/community/${communityId}/members/${memberId}`);

      if (response.data.success) {
        toast.success(response.data.message, { id: toastId });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Get community members with pagination and filters
  const getCommunityMembers = async (communityId, { search, role, page = 1, limit = 20 } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (role && role !== 'all') queryParams.append('role', role);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await api.get(`/community/${communityId}/members?${queryParams}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          creator: response.data.creator,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch members';
      toast.error(message);
      return { success: false, message };
    }
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
    communities,
    myCommunities,

    // Community Actions
    getCommunities,
    getMyCommunities,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    fetchCommunity,

    // Community Management
    getJoinRequests,
    handleJoinRequest,
    updateMemberRole,
    removeMemberFromCommunity,
    getCommunityMembers,

    // Post Actions
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
    incrementPostView,
    sharePost,
    likeComment,
    replyToComment,
    likeReply,
    updateCommentContent,
    deleteCommentContent,
    updateReplyContent,
    deleteReplyContent,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export { CommunityContext };