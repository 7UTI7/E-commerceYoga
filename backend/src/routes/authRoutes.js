const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getMe,        
  updateMe,
  updatePassword,
  getMyFavorites,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/register', registerUser);

const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/updatepassword', protect, updatePassword);
router.get('/me/favorites', protect, getMyFavorites);

router.get('/verifyemail/:token', verifyEmail);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;