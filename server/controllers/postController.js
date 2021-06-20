const AppError = require('../util/AppError');
const Post = require('../models/Post');
const catchAsync = require('../util/catchAsync');



//* @route: POST api/v1/posts
//* @desc: create new post
//* @ access: Private
const createPost = catchAsync(async (req, res, next) =>{
    await Post.init();
    let post = {...req.body};
    post.user = req.user._id;
    post = await Post.create(post);
    res.status(201).json({
        status:'Success',
        message:'Post was successfully created',
        post 
    })

});


//* @route: GET api/v1/posts
//* @desc: get all posts
//* @ access: Public
const getPosts = catchAsync(async (req, res, next) =>{
    const posts = await Post.find({}).sort('date');
    res.status(200).json({
        status:'Success',
        posts
    })
});

//* @route: GET api/v1/posts/:postId
//* @desc: get post by id
//* @ access: Public
const getPost = catchAsync(async (req, res, next) =>{
    const {postId} = req.params;
    const post = await Post.findById(postId);
    res.status(200).json({
        status:'Success',
        post
    })
});

//* @route: DELETE api/v1/posts/:postId
//* @desc: delete post by id
//* @ access: Private
const deletePost = catchAsync(async (req, res, next) =>{
    const {postId} = req.params;
    const post = await Post.findById(postId);

    if (post.user.toString() != req.user._id) {
        return next(new AppError('Unauthorized to delete this post', 'Failed', 401));
    }
    await post.remove();
    res.status(200).json({
        status:'Success',
        message:'Post was successfully deleted'
    })
});



//* @route: POST api/v1/posts/likes/:postId
//* @desc: like a post
//* @ access: Private
const likePost = catchAsync(async (req, res, next) =>{
    const {postId} = req.params;
    const post = await Post.findById(postId);
    const likes = [...post.likes];
    const unlikes = [...post.unlikes];
    const foundIndex = likes.findIndex((like) => {
        return like.user.toString() == req.user._id;
    });
    if (foundIndex !== -1) {
        likes.splice(foundIndex, 1);
        post.likes = likes;
        await post.save();
        return res.status(200).json({
            status:'Success',
            message:'Like was successfully removed',
            post
        })  
    }
    else{
        const foundIndex = unlikes.findIndex((unlike) => {
            return unlike.user.toString() == req.user._id;
        });

        if (foundIndex !== -1) {
            unlikes.splice(foundIndex, 1);
            post.unlikes = unlikes;
        }

        likes.push({user:req.user._id});
        post.likes = likes;
        await post.save();

        res.status(200).json({
            status:'Success',
            message:'Like was successfully added',
            post
        })
    }
});


//* @route: POST api/v1/posts/unlikes/:postId
//* @desc: unlike a post
//* @ access: Private
const unlikePost = catchAsync(async (req, res, next) =>{
    const {postId} = req.params;
    const post = await Post.findById(postId);
    const likes = [...post.likes];
    const unlikes = [...post.unlikes];

    const foundIndex = unlikes.findIndex((unlike) => {
        return unlike.user.toString() == req.user._id;
    });

    if (foundIndex !== -1) {
        unlikes.splice(foundIndex, 1);
        post.unlikes = unlikes;
        await post.save();
        return res.status(200).json({
            status:'Success',
            message:'unLike was successfully removed',
            post
        })  
    }
    else{
        const foundIndex = likes.findIndex((like) => {
            return like.user.toString() == req.user._id;
        });

        if (foundIndex !== -1) {
            likes.splice(foundIndex, 1);
            post.likes = likes;
        }

        unlikes.push({user:req.user._id});
        post.unlikes = unlikes;
        await post.save();
        
        res.status(200).json({
            status:'Success',
            message:'unLike was successfully added',
            post
        })
    }
});


//* @route: POST api/v1/posts/comments/:postId
//* @desc: comment a post
//* @ access: Private
const commentPost = catchAsync(async (req, res, next) =>{
    const comment = {...req.body};
    const {postId} = req.params;
    const post = await Post.findById(postId);
    comment.user = req.user._id;

    post.comments.push(comment);
    await post.save();
    res.status(201).json({
        status:'Success',
        message:'Comment was successfully added',
        post
    })

});


//* @route: DELETE api/v1/posts/comments/:postId/:commentId
//* @desc: delete a comment
//* @ access: Private
const deleteComment = catchAsync(async (req, res, next) =>{
    const {postId} = req.params;
    const {commentId} = req.params;
    const post = await Post.findById(postId);
    const comments = [...post.comments];

    const filtered = comments.filter(comment=>{
        return comment._id.toString() != commentId;
    });
    if (filtered.length === comments.length) {
        return next(new AppError('No comment to delete', 'Failed', 404)); 
    }

    post.comments = filtered;
    await post.save();
    res.status(200).json({
        status:'Success',
        message:'Comment was successfully deleted'
    })

});

module.exports.createPost = createPost;
module.exports.getPosts = getPosts;
module.exports.getPost = getPost;
module.exports.deletePost = deletePost;
module.exports.likePost = likePost;
module.exports.unlikePost = unlikePost;
module.exports.commentPost = commentPost;
module.exports.deleteComment = deleteComment;