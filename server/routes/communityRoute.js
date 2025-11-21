import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { CacheKeys, getCacheTTL } from '../utils/cacheKeys.js';
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

const communityTTL = getCacheTTL('community');

// Public routes with caching
router.get('/', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.LIST(req.query.page || 1), communityTTL),
  getCommunities
);

router.get('/featured', 
  cacheMiddleware(() => CacheKeys.COMMUNITY.FEATURED(), communityTTL * 2),
  getFeaturedCommunities
);

router.get('/search', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.SEARCH(req.query.search, req.query.page || 1), communityTTL),
  searchCommunities
);

router.get('/stats', 
  cacheMiddleware(() => CacheKeys.COMMUNITY.STATS(), communityTTL * 2),
  getCommunityStats
);

router.get('/posts', 
  cacheMiddleware((req) => `community:posts:all:page:${req.query.page || 1}`, communityTTL / 2),
  getCommunityPosts
);

router.get('/posts/trending', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.TRENDING_POSTS(req.query.page || 1), communityTTL / 2),
  getTrendingPosts
);

router.get('/posts/:id', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.POST_DETAIL(req.params.id), communityTTL),
  getCommunityPostById
);

router.get('/:id', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.DETAIL(req.params.id), communityTTL),
  getCommunity
);

// Protected routes
router.use(isAuthenticated);

// Community CRUD
router.post('/', upload.array('image', 1), createCommunity);
router.put('/:id', upload.array('image', 1), updateCommunity);
router.delete('/:id', deleteCommunity);

// User communities
router.get('/user/:userId', 
  cacheMiddleware((req) => CacheKeys.COMMUNITY.USER_COMMUNITIES(req.params.userId), communityTTL),
  getUserCommunities
);

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