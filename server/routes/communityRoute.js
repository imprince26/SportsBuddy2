import express from 'express';
import {
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
router.get('/posts', getCommunityPosts);
router.get('/posts/trending', getTrendingPosts);
router.get('/posts/:id', getCommunityPostById);
router.get('/stats', getCommunityStats);

// Protected routes
router.use(isAuthenticated);
router.post('/posts', upload.array('images', 5), createCommunityPost);
router.put('/posts/:id', upload.array('images', 5), updateCommunityPost);
router.delete('/posts/:id', deleteCommunityPost);
router.post('/posts/:id/like', likeCommunityPost);
router.post('/posts/:id/comments', addCommentToPost);
router.get('/posts/following/feed', getFollowingPosts);

export default router;