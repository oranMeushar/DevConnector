const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const sendEmail = require('../util/sendEmail');
const crypto = require('crypto');


const generateToken = (userId) =>{
    const jwtOptions = {
        expiresIn:process.env.JWT_EXPIRE  * 60 * 60  //* 2 hour
    }
    return jwt.sign({userId}, process.env.JWT_SECRET, jwtOptions);
}


//* @route: POST api/v1/auth/signup
//* @desc: Sign up users
//* @ access: Public
const signUp = catchAsync(async(req, res, next) => {
    await User.init();
    const user = new User({
        ...req.body,
    });
    
    await user.save();
    user.__v = undefined;
    user.password = undefined; 
    const token = generateToken(user._id);
    res.status(201).json({
        status:'Success',
        message:'User was successfullt created',
        user,
        token
    })
});


//* @route: POST api/v1/auth/login
//* @desc: Login users
//* @ access: Public
const login = catchAsync(async(req, res, next) =>{
    const {email, password} = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide both email and password', 'Failed', 400))
    }

    const user = await User.findOne({email}).select('+password');


    if (!user || !await user.isPassword(password, user.password)) {
        return next(new AppError('Invalid email or password', 'Failed', 400));
    }

    user.password = undefined;
    user.__v = undefined;
    const token = generateToken(user._id);

    res.status(200).json({
        status:'Success',
        message:'Successfully login',
        user,
        token
    })

});


//* @route: POST api/v1/auth/current
//* @desc: return the current logged in user
//* @ access: private
const current = catchAsync(async(req, res, next)=>{
    req.user.__v = undefined;
    res.status(200).json({
        status:'Success',
        user:req.user
    })
});


//* @route: POST api/v1/auth/forgotPassword
//* @desc: send email to user to reset password
//* @ access: public
const forgotPassword = catchAsync(async(req, res, next) =>{
    const {email} = req.body;
    if (!email) {
        return next(new AppError('Please provide an email', 'Failed', 400));
    }

    const user = await User.findOne({email});

    if (!user) {
        return next(new AppError('Email was not found'));
    }

    const resetToken = await user.generateResetToken();
    const resetUrl = `${req.get('Origin')}/reset-password/${resetToken}`;
    try {
        await sendEmail(email, resetUrl);
        res.status(200).json({
            status:'Success',
            message:'Please check your email for password reset',
        });
    } catch(err){
        user.passwordRestToken = undefined;
        user.passwordRestExpired = undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('An error occured while sending the email', 'Failed', 500));//*500=server error
    }
});


//* @route: POST api/v1/auth/resetPassword
//* @desc: reset user password
//* @ access: public

const resetPassword = catchAsync(async(req, res, next) =>{
    const {resetToken} = req.params;
    const {password, passwordConfirm} = req.body;

    if (!resetToken) {
        return next(new AppError('Unauthorized', 'Failed', 401));
    }

    if (!password || !passwordConfirm) {
        return next(new AppError('Please provide password and password confirmation', 'Failed', 401));
    }

    const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        passwordResetToken:hashToken,
        passwordResetExpired:{$gt:Date.now()}
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired','Failed', 400));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetExpired = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    res.status(200).json({
        status: 'Success',
        message:'Password was successfully changed'
    })
});


const updatePassword = catchAsync(async(req, res, next) => {
    const user = req.user;
    const {oldPassword, newPassword, newPasswordConfirm} = req.body;
    if (!oldPassword) {
        return next(new AppError('Please provide old password', 'Failed', 400))
    }
    const isEqualPasswords = await user.isPassword(oldPassword, user.password);

    if (!isEqualPasswords) {
        return next(new AppError('incorrect old password', 'Failed', 401))
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();
    user.password = undefined;

    res.status(200).json({
        status:'Success',
        message:'Password was successfuly changed',
        user
    });
});

//* @route: DELETE api/v1/auth/
//* @desc: delete user account and his profile
//* @ access: private
const deleteUserAccount = catchAsync(async(req, res, next) => {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    await Profile.findOneAndDelete({user:userId});
    res.status(200).json({
        status:'Success',
        message:'Successfully deleted account'
    });
});

module.exports.signUp = signUp;
module.exports.login = login;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
module.exports.current = current;
module.exports.updatePassword = updatePassword;
module.exports.deleteUserAccount = deleteUserAccount;