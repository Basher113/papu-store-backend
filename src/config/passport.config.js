const {Strategy: JwtStrategy, ExtractJwt} = require("passport-jwt");
const authConfig = require("./auth.config");
const prisma = require("../db");
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: authConfig.access_secret
}

const configPassportJwt = (passport) => {
  passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
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

module.exports = {configPassportJwt};