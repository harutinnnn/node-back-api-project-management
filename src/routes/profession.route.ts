import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {ProfessionController} from "../controller/profession.controller";
import {ProfessionSchema} from "../schemas/profession.schema";


export const professionRouter = (context: AppContext) => {

    const router = Router();


    const professionController = new ProfessionController(context);

    router.get(
        "/",
        authenticateJWT,
        professionController.index
    );

    router.get(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        professionController.get
    );

    router.post(
        "/",
        authenticateJWT,
        validate(ProfessionSchema),
        professionController.create
    );

    router.delete(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        professionController.delete
    );

    return router
}

