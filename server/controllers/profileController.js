const AppError = require('../util/AppError');
const Profile = require('../models/Profile');
const catchAsync = require('../util/catchAsync');



//* @route: GET api/v1/profiles/current
//* @desc: Get user profile
//* @ access: Private
const getCurrentUserProfile = catchAsync(async(req, res, next) =>{
    const userId = req.user._id;
    const userProfile = await Profile.findOne({user: userId}).populate({
        path:'user',
        select:'name avatar'
    });

    if (!userProfile) {
        return next(new AppError('User profile was not found', 'Failed', 404));
    }

    res.status(200).json({
        status:'Success',
        userProfile
    })
});

//* @route: POST api/v1/profiles
//* @desc: create or update user profile
//* @ access: Private
const createAndUpdateUserProfile = catchAsync(async(req, res, next) =>{
    let profile;
    await Profile.init();
    profile = await Profile.findOne({user:req.user._id}).populate({
        path:'user',
        select:'name'
    });
    if (!profile) {
        profile = await Profile.create({...req.body, user:req.user._id});
        return res.status(200).json({
            status:'Success',
            message:'Profile was successfully created',
            profile
        });
    }

    for (const key in req.body) {
        profile[key] = req.body[key];
    }

    await profile.save();
    res.status(200).json({
        status:'Success',
        message:'Profile was successfully updated',
        profile
    });
});


//* @route: GET api/v1/profiles/:handle
//* @desc: Get user profile by handle
//* @ access: Public
const getProfileByHandle = catchAsync(async(req, res, next) =>{
    const {handle} = req.params;
    const profile = await Profile.find({handle}).populate('user', ['name']);
    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }
    res.status(200).json({
        status:'Success',
        count:profile.length,
        profile
    })

});

//* @route: GET api/v1/profiles/:id
//* @desc: Get profile by id
//* @ access: Public
const getProfileById = catchAsync(async(req, res, next) =>{
    const {id} = req.params;
    const profile = await Profile.findById(id).populate('user', ['name']);
    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }
    res.status(200).json({
        status:'Success',
        profile
    })
});

//* @route: GET api/v1/profiles
//* @desc: Get all profiles
//* @ access: Public
const getProfiles = catchAsync(async(req, res, next) =>{
    const profiles = await Profile.find({}).populate('user', ['name']);
    res.status(200).json({
        status:'Success',
        count:profiles.length,
        profiles
    })
});


//* @route: POST api/v1/profiles/experience
//* @desc: create  experience
//* @ access: Private
const createExperience = catchAsync(async(req, res, next) =>{
    const profile = await Profile.findOne({user:req.user._id});
    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }

    profile.experience.unshift({...req.body});
    await profile.save();
    res.status(200).json({
        status:'Success',
        profile
    })
});


//* @route: POST api/v1/profiles/education
//* @desc: create  education
//* @ access: Private
const createEducation = catchAsync(async(req, res, next) =>{

    const profile = await Profile.findOne({user:req.user._id});

    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }

    profile.education.unshift({...req.body});
    await profile.save();
    res.status(200).json({
        status:'Success',
        profile
    })
});


//* @route: DELETE api/v1/profiles/experience/:expId
//* @desc: delete experience from profile by id
//* @ access: Private
const deleteExperience = catchAsync(async(req, res, next) =>{
    const profile = await Profile.findOne({user:req.user._id});
    const {expId} = req.params;
    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }

    const experience = [...profile.experience];
    const filteredExperience = experience.filter((exp) =>{
        return exp._id != expId;
    });

    profile.experience = filteredExperience;
    await profile.save();
    res.status(200).json({
        status:'Success',
        message:'Successfully deleted experience',
        profile
    })
});


//* @route: DELETE api/v1/profiles/education/:eduId
//* @desc: delete education from profile by id
//* @ access: Private
const deleteEducation = catchAsync(async(req, res, next) =>{
    const profile = await Profile.findOne({user:req.user._id});
    const {eduId} = req.params;
    if (!profile) {
        return next(new AppError('No profile was found', 'Failed', 404));
    }

    const education = [...profile.education];
    const filteredEducation = education.filter((education) =>{
        return education._id != eduId;
    });

    profile.education = filteredEducation;
    await profile.save();
    res.status(200).json({
        status:'Success',
        message:'Successfully deleted education',
        profile
    })
});

module.exports.getCurrentUserProfile = getCurrentUserProfile;
module.exports.getProfileByHandle = getProfileByHandle;
module.exports.getProfileById = getProfileById;
module.exports.getProfiles = getProfiles;
module.exports.createAndUpdateUserProfile = createAndUpdateUserProfile;
module.exports.createExperience = createExperience;
module.exports.createEducation = createEducation;
module.exports.deleteExperience = deleteExperience;
module.exports.deleteEducation = deleteEducation;