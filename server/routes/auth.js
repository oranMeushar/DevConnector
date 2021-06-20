const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/authController');


router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/current', passport.authenticate('jwt', { session: false }), authController.current);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/updatePassword',passport.authenticate('jwt', { session: false }), authController.updatePassword);
router.delete('/',passport.authenticate('jwt', { session: false }), authController.deleteUserAccount);
router.post('/resetPassword/:resetToken', authController.resetPassword);


module.exports = router;