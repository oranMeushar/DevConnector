const express = require('express');
const passport = require('passport');

const router = express.Router();

const profileController = require('../controllers/profileController');

router.post('/', passport.authenticate('jwt', { session: false }), profileController.createAndUpdateUserProfile);
router.post('/experience', passport.authenticate('jwt', { session: false }), profileController.createExperience);
router.post('/education', passport.authenticate('jwt', { session: false }), profileController.createEducation);
router.delete('/experience/:expId', passport.authenticate('jwt', { session: false }), profileController.deleteExperience);
router.delete('/education/:eduId', passport.authenticate('jwt', { session: false }), profileController.deleteEducation);
router.get('/', profileController.getProfiles);
router.get('/current', passport.authenticate('jwt', { session: false }), profileController.getCurrentUserProfile);
router.get('/handle/:handle', profileController.getProfileByHandle);
router.get('/:id', profileController.getProfileById);

module.exports = router;