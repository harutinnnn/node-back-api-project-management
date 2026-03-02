import {Router} from 'express';
import {validate, validateParams} from "../middlewares/validate";
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {ProfessionSchema} from "../schemas/profession.schema";
import {BoardController} from "../controller/board.controller";
import {
    BoardColumnSchema,
    BoardSchema, DeleteBoardColPayload,
    DeleteBoardTaskPayload,
    SortColumnsPayload,
    TaskSchema, TaskUpdateSchema
} from "../schemas/board.column.schema";


export const boardRouter = (context: AppContext) => {

    const router = Router();


    const boardController = new BoardController(context);


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
        "/sort-column",
        authenticateJWT,
        validate(SortColumnsPayload),
        boardController.sortColumn
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

