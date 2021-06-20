const express = require('express');
const passport = require('passport');

const router = express.Router();

const postController = require('../controllers/postController');

router.post('/', passport.authenticate('jwt', { session: false }), postController.createPost);
router.get('/', postController.getPosts);
router.post('/likes/:postId', passport.authenticate('jwt', { session: false }), postController.likePost);
router.post('/unlikes/:postId', passport.authenticate('jwt', { session: false }), postController.unlikePost);
router.post('/comments/:postId', passport.authenticate('jwt', { session: false }), postController.commentPost);
router.delete('/comments/:postId/:commentId', passport.authenticate('jwt', { session: false }), postController.deleteComment);
router.delete('/:postId', passport.authenticate('jwt', { session: false }), postController.deletePost);
router.get('/:postId', postController.getPost);


module.exports = router;