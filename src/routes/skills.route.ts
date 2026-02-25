import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import multer from "multer";
import {storage} from "../config/storage";
import {SkillsController} from "../controller/skils.controller";
import {SkillsSchema} from "../schemas/skills.schema";
import {IdParamSchema} from "../schemas/IdParamSchema";


const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const skillsRouter = (context: AppContext) => {

    const router = Router();


    const skillsController = new SkillsController(context);

    router.get(
        "/",
        authenticateJWT,
        skillsController.index
    );

    router.get(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        skillsController.get
    );

    router.post(
        "/",
        authenticateJWT,
        validate(SkillsSchema),
        skillsController.create
    );

    router.delete(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        skillsController.delete
    );

    return router
}

