const {Strategy: JwtStrategy, ExtractJwt} = require("passport-jwt");
const {Strategy: GoogleOauthStrategy} = require("passport-google-oauth2");
const authConfig = require("./auth.config");
const urlsConfig = require("./urls.config");

const prisma = require("../db");

const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.accessToken;
    }
    return token;
};

const passportJwtOpts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: authConfig.access_secret
}

const configPassportJwt = (passport) => {
  passport.use(new JwtStrategy(passportJwtOpts, async (jwtPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {id: jwtPayload.userId},
        select: {
          id: true,
          username: true,
          email: true
        }
      });

      if (user) {
        return done(null, user);
      }
      return done(null, false, {message: "No user found"});
    } catch (error) {
      return done(error, false);
    }
  }))
}



// Checkout this repo: (https://github.com/nemanjam/mern-boilerplate)
const clientUrl = process.env.NODE_ENV === 'production' ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev;
const googleOauth2Opts = {
  clientID: authConfig.google_client_id,
  clientSecret: authConfig.google_client_secret,
  callbackURL: `${clientUrl}api/auth/google/callback`,
  proxy: true,
}


const configPassportGoogleOauth2 = (passport) => {
  passport.use(new GoogleOauthStrategy(
    googleOauth2Opts,
    async (accessToken, refreshToken, profile, done) => {
      
      try {
        const oldUser = await prisma.user.findUnique({
          where: { email: profile.email },
          select: {
            id: true,
            username: true,
            email: true,
          }
        });

        // Create user in db if no user found in db
        if (!oldUser) {
          const newUser = await prisma.user.create({
            data: {
              username: profile.displayName,
              email: profile.email,
              password: null,
              provider: "google",
              googleId: profile.id
            }
          });
          return done(null, newUser);
        };
        return done(null, oldUser);

      } catch (error) {
        return done(error, false);
      }
    }
  ))
}

module.exports = {configPassportJwt, configPassportGoogleOauth2};