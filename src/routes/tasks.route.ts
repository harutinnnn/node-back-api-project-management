import {Router} from 'express';
import {validate} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {ProjectController} from "../controller/project.controller";
import {DeleteProjectSchema, ProjectSchema} from "../schemas/project.schema";
import {TaskController} from "../controller/task.controller";
import {TaskSchema} from "../schemas/task.schema";

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
        taskController.create
    );

    router.delete(
        "/delete",
        authenticateJWT,
        validate(DeleteProjectSchema),
        taskController.delete
    );

    return router
}

