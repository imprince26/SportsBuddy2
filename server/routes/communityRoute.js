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
  getFollowingPosts
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
router.get('/:id', getCommunity);

// Protected routes
router.use(isAuthenticated);

// Community CRUD
router.post('/', upload.array('image', 1), createCommunity);
router.put('/:id', upload.array('image', 1), updateCommunity);
router.delete('/:id', deleteCommunity);

// User communities
router.get('/user/:userId', getUserCommunities);

// Community membership
router.post('/:id/join', joinCommunity);
router.post('/:id/leave', leaveCommunity);

// Community posts
router.post('/posts', upload.array('images', 5), createCommunityPost);
router.put('/posts/:id', upload.array('images', 5), updateCommunityPost);
router.delete('/posts/:id', deleteCommunityPost);
router.post('/posts/:id/like', likeCommunityPost);
router.post('/posts/:id/comments', addCommentToPost);
router.get('/posts/following/feed', getFollowingPosts);

export default router;