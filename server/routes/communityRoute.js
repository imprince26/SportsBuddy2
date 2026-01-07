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
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getCommunities);

router.get('/featured', getFeaturedCommunities);

router.get('/search', searchCommunities);

router.get('/stats', getCommunityStats);

router.get('/posts', getCommunityPosts);

router.get('/posts/trending', getTrendingPosts);

router.get('/posts/:id', getCommunityPostById);

// Protected routes
router.use(isAuthenticated);

// User communities (must be before /:id to avoid conflicts)
router.get('/my-communities', getUserCommunities);
router.get('/user/:userId', getUserCommunities);

// Community detail (after specific routes)
router.get('/:id', getCommunity);

// Community CRUD
router.post('/', upload.array('image', 1), createCommunity);
router.put('/:id', upload.array('image', 1), updateCommunity); // Creator or admin can update
router.delete('/:id', deleteCommunity); // Creator or admin can delete

// Community membership
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);

// Community management
router.get('/:id/join-requests', getJoinRequests);
router.post('/:id/join-requests/:requestId', handleJoinRequest);
router.get('/:id/members', getCommunityMembers);
router.put('/:id/members/:memberId/role', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

// Community posts
router.post('/posts', upload.array('images', 5), createCommunityPost);
router.put('/posts/:id', upload.array('images', 5), updateCommunityPost);
router.delete('/posts/:id', deleteCommunityPost);
router.post('/posts/:id/like', likeCommunityPost);
router.post('/posts/:id/view', incrementPostView);
router.post('/posts/:id/share', sharePost);
router.post('/posts/:id/comments', addCommentToPost);
router.put('/posts/:postId/comments/:commentId', updateComment);
router.delete('/posts/:postId/comments/:commentId', deleteComment);
router.post('/posts/:postId/comments/:commentId/like', likeComment);
router.post('/posts/:postId/comments/:commentId/replies', replyToComment);
router.put('/posts/:postId/comments/:commentId/replies/:replyId', updateReply);
router.delete('/posts/:postId/comments/:commentId/replies/:replyId', deleteReply);
router.post('/posts/:postId/comments/:commentId/replies/:replyId/like', likeReply);
router.get('/posts/following/feed', getFollowingPosts);

export default router;