const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require('../controllers/whatsAppGroupController');


const { protect, admin } = require('../middleware/authMiddleware');


router.get('/', protect, getGroups);


router.post('/', protect, admin, createGroup);


router.get('/:id', protect, admin, getGroupById);


router.put('/:id', protect, admin, updateGroup);


router.delete('/:id', protect, admin, deleteGroup);

module.exports = router;