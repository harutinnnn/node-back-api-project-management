import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {NotificationController} from "../controller/notification.controller";
import {validate} from "../middlewares/validate";
import {IdParamSchema} from "../schemas/notificationsSchema";


export const notificationRouter = (context: AppContext) => {

    const router = Router();


    const notificationController = new NotificationController(context);

    router.get(
        "/",
        authenticateJWT,
        notificationController.index
    );

    router.post(
        "/update",
        authenticateJWT,
        validate(IdParamSchema),
        notificationController.update
    );

    return router
}

