const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



const options = {
    optimisticConcurrency:true,
    timestamps:true,
    selectPopulatedPaths:false,
}

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please Provide a name'],
        minLength:[2, 'Name must contain at least 2 characters'],
        maxLength:[30, 'Name must contain at most 30 characters'],
    },
    email:{
        type:String,
        required:[true, 'Please Provide an email'],
        unique:[true, 'Email already exists'],
        maxLength:[50, 'Email must have at-most 50 characters'],
        validate:[isValidEmail, 'Invalid Email']
    },
    password:{
        type:String,
        required:[true, 'Please Provide a password'],
        minLength:[6, 'password must contain at-least 6 characters'],
        maxLength:[50, 'password must contain at-most 50 characters'],
    },
    passwordConfirm:{
        type:String,
        required:[true, 'Please Provide a password'],
        minLength:[6, 'Passwords are not equal or invalid'],
        maxLength:[50, 'Passwords are not equal or invalid'],
        validate:[isEqual, 'Passwords are not match']
    },
    avatar:{
        type:String,
        default:'https://www.gravatar.com/avatar/c210af79b45e5891502fda3c4c2139a0?s=200&r=pg&d=mm'
    },
    date:{
        type:Date,
        default:Date.now
    },
    passwordResetToken:{
        type:'string',
    },
    passwordResetExpired:{
        type:Date
    }
}, options);



function isValidEmail(email){
    return validator.isEmail(validator.trim(email));
}

function isEqual(passwordConfirm){
    return this.password === passwordConfirm;
}

userSchema.methods = {
    isPassword: async function(password, hashedPassword){
        return await bcrypt.compare(password, hashedPassword)
    },
    generateResetToken:async function(){
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpired = Date.now() + 15 * 60 * 1000;
        await this.save({validateBeforeSave:false});
        return resetToken;
    }
}


userSchema.pre('save', async function(next){
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        this.passwordConfirm = undefined;
    }
    next();
})

userSchema.pre('validate', function(next){
    this.name = validator.trim(this.name);
    next();
});



const User = mongoose.model('User', userSchema);
module.exports = User;