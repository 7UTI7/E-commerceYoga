const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleFavorite,
  createVideoComment
} = require('../controllers/videoController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getVideos);
router.get('/:id', getVideoById);

router.post('/:id/favorite', protect, toggleFavorite);

router.post('/:id/comments', protect, createVideoComment);

router.post('/', protect, admin, createVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

module.exports = router;