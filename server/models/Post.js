const mongoose = require('mongoose');
const validator = require('validator');

const options = {
    optimisticConcurrency:true,
    timestamps:true,
    selectPopulatedPaths:false,
}

const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    text:{
        type:String,
        required:[true, 'Text is required'],
        maxLength:[500, 'text must be at most 500 characters'],
        minLength:[2, 'text must be at least 2 characters']
    },
    name:{
        type:String
    },
    avatar:{
        type:String
    },
    likes:[
        {
            user:{
                type:mongoose.Types.ObjectId,
                ref:'User'
            },
        }
    ],
    unlikes:[
        {
            user:{
                type:mongoose.Types.ObjectId,
                ref:'User'
            },
        }
    ],
    comments:[
        {
            user:{
                type:mongoose.Types.ObjectId,
                ref:'User'
            },
            text:{
                type:String,
                required:[true, 'Text is required'],
                maxLength:[500, 'text must be at most 500 characters'],
                minLength:[2, 'text must be at least 2 characters']
            },
            name:{
                type:String
            },
            avatar:{
                type:String
            },
            date:{
                type:Date,
                default:Date.now
            }
        } 
    ],
    date:{
        type:Date,
        default:Date.now
    }
}, options);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;