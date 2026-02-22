import {Router} from 'express';
import {AuthController} from '../controller/auth.controller'
import {loginSchema} from "../schemas/login.schema";
import {UserSchema} from "../schemas/user.schema";
import {validate} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {UserController} from "../controller/user.controller";
import {authenticateJWT} from "../middlewares/auth";

export const userRouter = (context: AppContext) => {

    const router = Router();


    const userController = new UserController(context);

    router.get(
        "/",
        authenticateJWT,
        userController.index
    );
    return router
}

