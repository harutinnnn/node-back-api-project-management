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
import {CommentEditSchema, CommentSchema, TaskCommentSchema} from "../schemas/comment.schema";
import {MessageController} from "../controller/message.controller";
import {MemberMessagesSchema, MessageEditSchema} from "../schemas/message.schema";

export const messageRouter = (context: AppContext) => {

    const router = Router();

    const messageController = new MessageController(context);

    router.post(
        "/",
        authenticateJWT,
        validate(MemberMessagesSchema),
        messageController.index
    );

    router.post(
        "/create",
        authenticateJWT,
        validate(MessageEditSchema),
        messageController.create
    );

    router.put(
        "/edit",
        authenticateJWT,
        validate(CommentEditSchema),
        messageController.edit
    );

    router.delete(
        "/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        messageController.delete
    );

    return router
}

