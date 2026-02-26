import {Router} from 'express';
import {AuthController} from '../controller/auth.controller'
import {loginSchema} from "../schemas/login.schema";
import {UserSchema} from "../schemas/user.schema";
import {validate} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {UpdateUserSchema} from "../schemas/update.user.schema";

export const authRouter = (context: AppContext) => {

    const router = Router();


    const authController = new AuthController(context);

    router.post(
        "/login",
        validate(loginSchema),
        authController.login
    );

    router.get(
        "/me",
        authenticateJWT,
        authController.authMe
    );

    router.post(
        "/me",
        validate(UpdateUserSchema),
        authenticateJWT,
        authController.updateMe
    );

    router.post(
        "/register",
        validate(UserSchema),
        authController.register
    );

    router.post(
        "/refresh",
        authController.refresh
    );


    router.post(
        "/logout",
        authController.logout
    );


    return router
}

