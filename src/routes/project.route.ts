import {Router} from 'express';
import {validate} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {ProjectController} from "../controller/project.controller";
import {ProjectSchema} from "../schemas/project.schema";

export const projectRouter = (context: AppContext) => {

    const router = Router();


    const projectController = new ProjectController(context);

    router.post(
        "/create",
        authenticateJWT,
        validate(ProjectSchema),
        projectController.create
    );
    return router
}

