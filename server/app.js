const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const cors = require('cors');

const errorController = require('./controllers/errorController');
const authRouter = require('./routes/auth');
const posts = require('./routes/posts');
const profile = require('./routes/profile');

const isAuth = require('./middleware/isAuth');

const app = express();

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

dotenv.config({
    path:'./config/config.env'
}); 

const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30   minutes window
    max: 800 
});

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    max: 50
});

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 30, 
    message:"Too many accounts created from this IP, please try again after an hour"  
});

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

app.use(express.json({
    limit:'50kb'
}));

app.use(limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgotPassword', authLimiter);
app.use('/api/v1/auth/signup', createAccountLimiter);


app.use(cors());
app.use(passport.initialize());
passport.use(isAuth())

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', profile); 
app.use('/api/v1/posts', posts);
app.use(errorController);


(async()=>{
    const options = {
        useUnifiedTopology:true,
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        poolSize:10,
        serverSelectionTimeoutMS:10000,
        socketTimeoutMS:45000 
    }

    try{
        await mongoose.connect(process.env.CONNECT_MONGODB_LOCAL, options);
        console.log('Successfully connected to database');
    }
    catch (e){
        console.log(e);
    }
})();

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server starts on port ${PORT}`);
})


