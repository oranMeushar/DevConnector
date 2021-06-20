const User = require('../models/User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const isAuth = ()=>{
    const options = {}
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = process.env.JWT_SECRET;
    return new JwtStrategy(options, async(jwt_payload, done)=>{
        try{
            const user = await User.findById(jwt_payload.userId);
            if (!user) {
                return done(null, false);
                //*and by default i will be able to use later req.user in the protected routes
            }
            else{
                return done(null, user);
            }
        }
        catch(err){
            return done(err, false);
        }
    })
}

module.exports = isAuth;