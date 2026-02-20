import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "default_super_secret_key",
};

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            // jwtPayload is the decoded user object, we expect it to have an 'id'
            const [user] = await db.select().from(users).where(eq(users.id, jwtPayload.id));

            if (user) {
                return done(null, user);
            }
            return done(null, false); // No user found
        } catch (error) {
            return done(error, false);
        }
    })
);

export default passport;
