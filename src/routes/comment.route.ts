import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {TaskController} from "../controller/task.controller";
import {TaskSchema} from "../schemas/task.schema";
import multer from "multer";
import {storage} from "../config/storage";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {CommentController} from "../controller/comment.controller";
import {CommentSchema, TaskCommentSchema} from "../schemas/comment.schema";


const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const commentRouter = (context: AppContext) => {

    const router = Router();


    const commentController = new CommentController(context);

    router.post(
        "/",
        authenticateJWT,
        validate(TaskCommentSchema),
        commentController.index
    );

    router.post(
        "/create",
        authenticateJWT,
        validate(CommentSchema),
        upload.array("attachments", 5),
        commentController.create
    );

    router.delete(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        commentController.delete
    );

    return router
}

