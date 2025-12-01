const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');

router.get('/', searchContent);

module.exports = router;