import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {ProfessionController} from "../controller/profession.controller";
import {ProfessionSchema} from "../schemas/profession.schema";
import {ProjectSchema} from "../schemas/project.schema";
import {ProjectController} from "../controller/project.controller";


export const projectRouter = (context: AppContext) => {

    const router = Router();


    const projectController = new ProjectController(context);

    router.get(
        "/",
        authenticateJWT,
        projectController.index
    );

    router.get(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        projectController.get
    );

    router.post(
        "/",
        authenticateJWT,
        validate(ProjectSchema),
        projectController.create
    );

    router.delete(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        projectController.delete
    );

    return router
}

