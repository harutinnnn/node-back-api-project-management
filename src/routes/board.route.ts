import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {BoardController} from "../controller/board.controller";
import {
    BoardColumnSchema,
    BoardSchema, DeleteBoardColPayload,
    DeleteBoardTaskPayload,
    SortColumnsPayload, SortTasksPayload, TaskFileUpload,
    TaskSchema, TaskUpdateSchema
} from "../schemas/board.column.schema";
import multer from "multer";
import {storage} from "../config/storage";
import {IdParamSchema} from "../schemas/IdParamSchema";


const avatarUpload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 5MB
    },
});


export const boardRouter = (context: AppContext) => {

    const router = Router();


    const boardController = new BoardController(context);


    router.get(
        "/tasks",
        authenticateJWT,
        boardController.tasks
    );


    router.post(
        "/project",
        authenticateJWT,
        validate(BoardSchema),
        boardController.getBoardData
    );

    router.post(
        "/column",
        authenticateJWT,
        validate(BoardColumnSchema),
        boardController.createColumn
    );

    router.post(
        "/task",
        authenticateJWT,
        validate(TaskSchema),
        boardController.createTask
    );

    router.put(
        "/task",
        authenticateJWT,
        validate(TaskUpdateSchema),
        boardController.updateTask
    );

    router.post(
        "/task-file",
        authenticateJWT,
        avatarUpload.single('file'),
        validate(TaskFileUpload),
        boardController.file
    );

    router.get(
        "/task-files/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        boardController.getFile
    );

    router.post(
        "/sort-column",
        authenticateJWT,
        validate(SortColumnsPayload),
        boardController.sortColumn
    );

    router.post(
        "/sort-tasks",
        authenticateJWT,
        validate(SortTasksPayload),
        boardController.sortTasks
    );

    router.post(
        "/delete-task",
        authenticateJWT,
        validate(DeleteBoardTaskPayload),
        boardController.deleteTask
    );
    router.post(
        "/delete-column",
        authenticateJWT,
        validate(DeleteBoardColPayload),
        boardController.deleteColumn
    );

    return router
}

