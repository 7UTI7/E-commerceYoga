const express = require('express');
const router = express.Router();

const {getPublishedArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle, createArticleComment} = require('../controllers/articleController');

const {protect, admin} = require('../middleware/authMiddleware');

router.get('/', getPublishedArticles);
router.get('/:slug', getArticleBySlug);

router.post('/:id/comments', protect, createArticleComment);

router.post('/', protect, admin, createArticle);

router.put('/:id', protect, admin, updateArticle);

router.delete('/:id', protect, admin, deleteArticle);

module.exports = router;