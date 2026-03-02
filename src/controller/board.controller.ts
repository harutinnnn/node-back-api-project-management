import {Request, Response} from "express";
import {AppContext} from "../types/app.context.type";
import {boardColumns, tasks} from "../db/schema";
import {
    BoardColumnSchema,
    BoardSchema, DeleteBoardColPayload,
    DeleteBoardTaskPayload,
    SortColumnsPayload,
    TaskSchema, TaskUpdateSchema
} from "../schemas/board.column.schema";
import {BoardDataService} from "../services/BoardDataService";
import {and, eq, max, sql} from "drizzle-orm";
import {TaskType} from "../types/board.data.type";

export class BoardController {

    private boardDataService: BoardDataService;


    constructor(private context: AppContext) {
        this.boardDataService = new BoardDataService(this.context);
    }

    getBoardData = async (req: Request, res: Response) => {

        const validatedData = BoardSchema.parse(req.body);

        try {

            const boardData = await this.boardDataService.getBoardData(Number(req.user?.companyId), validatedData.projectId)
            res.send(boardData);

        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to fetch board data"});
        }
    }

    createColumn = async (req: Request, res: Response) => {

        const validatedData = BoardColumnSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                const [maxPos] = await this.context.db.select({
                    pos: sql<number>`max(
                    ${boardColumns.pos}
                    )`
                }).from(boardColumns).where(eq(boardColumns.projectId, validatedData.projectId))
                console.log(maxPos)

                const result = await this.context.db.insert(boardColumns).values({
                    title: validatedData.title,
                    companyId: req.user?.companyId,
                    projectId: validatedData.projectId,
                }).$returningId();

                return res.json({
                    id: result[0].id,
                    title: validatedData.title,
                    pos: maxPos?.pos || 0
                });

            } else {
                return res.status(500).json({error: "Failed to create profession"});
            }

        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create member"});
        }
    }

    createTask = async (req: Request, res: Response) => {

        const validatedData = TaskSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                const result = await this.context.db.insert(tasks).values({
                    projectId: validatedData.projectId,
                    columnId: validatedData?.columnId,
                    title: validatedData.title,
                    description: validatedData.description,
                    priority: validatedData.priority,
                    assignee: validatedData?.assignee,
                    dueDate: validatedData?.dueDate,
                }).$returningId();

                return res.json({
                    id: result[0].id,
                    title: validatedData.title,
                });

            } else {
                return res.status(500).json({error: "Failed to create profession"});
            }

        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create task"});
        }
    }

    updateTask = async (req: Request, res: Response) => {

        const validatedData = TaskUpdateSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                const taskData: Omit<TaskType, "id" | "createdAt" | "status"> = {
                    projectId: Number(validatedData.projectId),
                    columnId: validatedData?.columnId,
                    title: validatedData.title,
                    description: validatedData.description,
                    priority: validatedData.priority,
                }

                const result = await this.context.db.update(tasks).set(taskData).where(
                    and(
                        eq(tasks.projectId, validatedData.projectId),
                        eq(tasks.id, validatedData.id),
                        eq(tasks.columnId, validatedData.columnId),
                    )
                );

                return res.json(taskData);

            } else {
                return res.status(500).json({error: "Failed to create profession"});
            }

        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create task"});
        }
    }

    deleteColumn = async (req: Request, res: Response) => {
        const validatedData = DeleteBoardColPayload.parse(req.body);

        try {

            await this.context.db.delete(boardColumns).where(and(eq(boardColumns.projectId, validatedData.projectId), eq(boardColumns.id, validatedData.columnId)))

            res.status(200).json({
                projectId: validatedData.projectId,
                columnId: validatedData.projectId,
            })
        } catch (err) {
            console.error(err);

            res.status(500).json({error: "Failed to fetch professions"});
        }
    }

    deleteTask = async (req: Request, res: Response) => {
        const validatedData = DeleteBoardTaskPayload.parse(req.body);

        try {

            await this.context.db.delete(tasks).where(and(eq(tasks.id, validatedData.taskId), eq(tasks.columnId, validatedData.columnId)))

            res.status(200).json({
                taskId: validatedData.taskId,
                columnId: validatedData.columnId,
            })
        } catch (err) {
            console.error(err);

            res.status(500).json({error: "Failed to fetch professions"});
        }
    }


    sortColumn = async (req: Request, res: Response) => {
        const validatedData = SortColumnsPayload.parse(req.body);

        try {

            const columns = await this.boardDataService.sortBoardColumns(validatedData.projectId, validatedData.columns || [])

            res.status(200).json({
                columns: columns
            })
        } catch (err) {
            console.error(err);

            res.status(500).json({error: "Failed to fetch professions"});
        }
    }


}