import cors from "cors";
import express from "express";
import passport from "../config/passport";
import {AppContext} from "../types/app.context.type";
import {authRouter} from "./auth.route";
import {userRouter} from "./user.route";

export const createApp = (context: AppContext) => {

    const app = express();


    app.use(cors());
    app.use(express.json());
    app.use(passport.initialize());


    app.use('/auth', authRouter(context));
    app.use('/users', userRouter(context));


    return app;
}
