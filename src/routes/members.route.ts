import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {DeleteProjectSchema, ProjectSchema} from "../schemas/project.schema";
import multer from "multer";
import {storage} from "../config/storage";
import {MembersController} from "../controller/members.controller";
import {DeleteTaskSchema, MemberSchema} from "../schemas/members.schema";


const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const membersRouter = (context: AppContext) => {

    const router = Router();


    const membersController = new MembersController(context);

    router.get(
        "/",
        authenticateJWT,
        membersController.index
    );

    router.get(
        "/:id",
        authenticateJWT,
        validateParams(DeleteTaskSchema),
        membersController.get
    );

    router.post(
        "/",
        authenticateJWT,
        validate(MemberSchema),
        membersController.create
    );

    router.delete(
        "/",
        authenticateJWT,
        validate(DeleteProjectSchema),
        membersController.delete
    );

    return router
}

