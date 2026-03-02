import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {NotificationController} from "../controller/notification.controller";


export const notificationRouter = (context: AppContext) => {

    const router = Router();


    const notificationController = new NotificationController(context);

    router.get(
        "/",
        authenticateJWT,
        notificationController.index
    );

    return router
}

