import {Router} from 'express';
import {validate} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {TaskController} from "../controller/task.controller";
import {TaskSchema} from "../schemas/task.schema";
import multer from "multer";
import {storage} from "../config/storage";
import {IdParamSchema} from "../schemas/IdParamSchema";


const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const taskstRouter = (context: AppContext) => {

    const router = Router();


    const taskController = new TaskController(context);

    router.get(
        "/",
        authenticateJWT,
        taskController.index
    );

    router.post(
        "/create",
        authenticateJWT,
        validate(TaskSchema),
        upload.array("attachments", 5),
        taskController.create
    );

    router.delete(
        "/delete",
        authenticateJWT,
        validate(IdParamSchema),
        taskController.delete
    );

    return router
}

