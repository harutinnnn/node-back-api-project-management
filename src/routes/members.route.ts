import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import multer from "multer";
import {storage} from "../config/storage";
import {MembersController} from "../controller/members.controller";
import {MemberSchema} from "../schemas/members.schema";
import {IdParamSchema} from "../schemas/IdParamSchema";


const avatarUpload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 5MB
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
        validateParams(IdParamSchema),
        membersController.get
    );

    router.post(
        "/",
        authenticateJWT,
        validate(MemberSchema),
        membersController.create
    );

    router.post(
        "/avatar",
        authenticateJWT,
        avatarUpload.single('avatar'),
        membersController.avatar
    );

    router.delete(
        "/",
        authenticateJWT,
        validate(IdParamSchema),
        membersController.delete
    );

    return router
}

