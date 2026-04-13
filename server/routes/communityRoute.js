import express from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  getUserCommunities,
  getFeaturedCommunities,
  searchCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  createCommunityPost,
  getCommunityPostById,
  updateCommunityPost,
  deleteCommunityPost,
  likeCommunityPost,
  addCommentToPost,
  getCommunityStats,
  getTrendingPosts,
  getFollowingPosts,
  incrementPostView,
  sharePost,
  likeComment,
  replyToComment,
  likeReply,
  updateComment,
  deleteComment,
  updateReply,
  deleteReply,
  getJoinRequests,
  handleJoinRequest,
  updateMemberRole,
  removeMember,
  getCommunityMembers
} from '../controllers/communityController.js';
import { isAuthenticated, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  publicSearchLimiter,
  userWriteLimiter,
  uploadLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public routes
router.get('/', getCommunities);

router.get('/featured', getFeaturedCommunities);

router.get('/search', publicSearchLimiter, searchCommunities);

router.get('/stats', getCommunityStats);

router.get('/posts', getCommunityPosts);

router.get('/posts/trending', getTrendingPosts);

router.get('/posts/:id', getCommunityPostById);

// Community detail with optional auth (allows guests to view)
router.get('/:id', optionalAuth, getCommunity);

// Protected routes
router.use(isAuthenticated);

// User communities (must be before /:id to avoid conflicts)
router.get('/my-communities', getUserCommunities);
router.get('/user/:userId', getUserCommunities);

// Community CRUD
router.post('/', userWriteLimiter, uploadLimiter, upload.array('image', 1), createCommunity);
router.put('/:id', userWriteLimiter, uploadLimiter, upload.array('image', 1), updateCommunity); // Creator or admin can update
router.delete('/:id', userWriteLimiter, deleteCommunity); // Creator or admin can delete

// Community membership
router.post('/:id/join', userWriteLimiter, joinCommunity);
router.post('/:id/leave', userWriteLimiter, leaveCommunity);

// Community management
router.get('/:id/join-requests', getJoinRequests);
router.post('/:id/join-requests/:requestId', userWriteLimiter, handleJoinRequest);
router.get('/:id/members', getCommunityMembers);
router.put('/:id/members/:memberId/role', userWriteLimiter, updateMemberRole);
router.delete('/:id/members/:memberId', userWriteLimiter, removeMember);

// Community posts
router.post('/posts', userWriteLimiter, uploadLimiter, upload.array('images', 5), createCommunityPost);
router.put('/posts/:id', userWriteLimiter, uploadLimiter, upload.array('images', 5), updateCommunityPost);
router.delete('/posts/:id', userWriteLimiter, deleteCommunityPost);
router.post('/posts/:id/like', userWriteLimiter, likeCommunityPost);
router.post('/posts/:id/view', userWriteLimiter, incrementPostView);
router.post('/posts/:id/share', userWriteLimiter, sharePost);
router.post('/posts/:id/comments', userWriteLimiter, addCommentToPost);
router.put('/posts/:postId/comments/:commentId', userWriteLimiter, updateComment);
router.delete('/posts/:postId/comments/:commentId', userWriteLimiter, deleteComment);
router.post('/posts/:postId/comments/:commentId/like', userWriteLimiter, likeComment);
router.post('/posts/:postId/comments/:commentId/replies', userWriteLimiter, replyToComment);
router.put('/posts/:postId/comments/:commentId/replies/:replyId', userWriteLimiter, updateReply);
router.delete('/posts/:postId/comments/:commentId/replies/:replyId', userWriteLimiter, deleteReply);
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', userWriteLimiter, likeReply);
router.get('/posts/following/feed', getFollowingPosts);

export default router;
