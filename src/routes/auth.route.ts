import {Router} from 'express';
import {AuthController} from '../controller/auth.controller'
import { loginSchema } from "../schemas/login.schema";
import {validate} from "../middlewares/validate";

export const authRouter = () => {

    const router = Router();


    const authController = new AuthController();

    router.post(
        "/login",
        validate(loginSchema),
        authController.login
    );

    return router
}

