const mongoose = require('mongoose');
const fetch = require('node-fetch');
const validator = require('validator');
const { findByIdAndUpdate } = require('./Post');
const User = require('./User');

const options = {
    optimisticConcurrency:true,
    timestamps:true,
    selectPopulatedPaths:false,
}

const experienceSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'title is required']
    },
    company:{
        type:String,
        required:[true, 'company is required']
    },
    location:{
        type:String
    },
    from:{
        type:Date,
        required:[true, 'Start date is required']
    },
    to:{
        type:Date,
        required:[isCurrent, 'End date is required']
    },
    current:{
        type:Boolean,
        default:false
    },
    description:{
        type:String
    }
})

experienceSchema.pre('validate', function(next){
   this.title = validator.trim(this.title);
   this.company = validator.trim(this.company);
   next();
});

const educationSchema = new mongoose.Schema({
    school:{
        type:String,
        required:[true, 'school is required']
    },
    degree:{
        type:String,
        required:[true, 'degree is required']
    },
    fieldOfStudy:{
        type:String,
        required:[true, 'Field of study is required']
    },
    from:{
        type:Date,
        required:[true, 'Start date is required']
    },
    to:{
        type:Date,
        required:[isCurrent, 'End date is required']
    },
    current:{
        type:Boolean,
        default:false
    },
    description:{
        type:String
    }
})

educationSchema.pre('validate', function(next){
    this.school = validator.trim(this.school);
    this.degree = validator.trim(this.degree);
    this.fieldOfStudy = validator.trim(this.fieldOfStudy);
    next();
});

const profileSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    handle:{
        type:'String',
        required:[true, 'handle is required'],
        maxlength:[40, 'handle max length is 40']
    },
    company:{
        type:'String'
    },
    website:{
        type:'String',
        validate:[isURL, 'Invalid URL in website input']
    },
    location:{
        type:'String'
    },
    avatar:{
        type:String,
        default:'https://www.gravatar.com/avatar/c210af79b45e5891502fda3c4c2139a0?s=200&r=pg&d=mm'
    },
    status:{
        type:'String',
        required:[true, 'status is required'],
    },
    skills:{
        type:[String],
        required:[true, 'skills is required'],
        validate:[isNotEmpty, 'skills is required']
    },
    bio:{
        type:'String'
    },
    githubUsername:{
        type:'String'
    },
    experience:{
        type:[experienceSchema]
    },
    education:{
        type:[educationSchema]
    },
    social:{
        youtube:{
            type:String,
            validate:[isURL, 'Invalid URL in youtube input']
        },
        twitter:{
            type:String,
            validate:[isURL, 'Invalid URL in twitter input']
        },
        facebook:{
            type:String,
            validate:[isURL, 'Invalid URL in facebook input']
        },
        linkedin:{
            type:String,
            validate:[isURL, 'Invalid URL in linkedin input']
        },
        instagram:{
            type:String,
            validate:[isURL, 'Invalid URL in instagram input']
        }
    },
    date:{
        type:Date,
        default:Date.now
    }

}, options);



function isURL(url){
    return validator.isURL(url) || url.length === 0;
}

function isNotEmpty(arr){
    return arr.length !== 0 && arr[0] != "";
}

function isCurrent(){
    return this.current === false;
}

profileSchema.pre('validate', function(next){
    this.handle = validator.trim(this.handle);
    this.status = validator.trim(this.status);
    next();
});


profileSchema.pre('save', async function(next){
    if (this.isModified('githubUsername')) {
        const res = await fetch(`https://api.github.com/users/${this.githubUsername}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`);
        const data = await res.json();
        this.avatar = data.avatar_url || 'https://www.gravatar.com/avatar/c210af79b45e5891502fda3c4c2139a0?s=200&r=pg&d=mm';
        if (data.avatar_url) {
            await User.findByIdAndUpdate(this.user, {avatar:data.avatar_url});
        }
        else{
            await User.findByIdAndUpdate(this.user, {avatar:'https://www.gravatar.com/avatar/c210af79b45e5891502fda3c4c2139a0?s=200&r=pg&d=mm'});
        }
    }
    next();
})

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;