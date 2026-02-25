import cors from "cors";
import express from "express";
import passport from "../config/passport";
import {AppContext} from "../types/app.context.type";
import {authRouter} from "./auth.route";
import {userRouter} from "./user.route";
import {projectRouter} from "./project.route";
import {taskstRouter} from "./tasks.route";
import {membersRouter} from "./members.route";
import {skillsRouter} from "./skills.route";

export const createApp = (context: AppContext) => {

    const app = express();


    app.use(cors());
    app.use(express.json());
    app.use(passport.initialize());


    app.use('/auth', authRouter(context));
    app.use('/users', userRouter(context));
    app.use('/project', projectRouter(context));
    app.use('/tasks', taskstRouter(context));
    app.use('/member', membersRouter(context));
    app.use('/skills', skillsRouter(context));


    return app;
}
