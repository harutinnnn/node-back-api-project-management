import {Request, Response} from "express";
import {AppContext} from "../types/app.context.type";
import {boardColumns, notifications, projects, taskFiles, taskMembers, tasks, users} from "../db/schema";
import {
    BoardColumnSchema,
    BoardSchema, DeleteBoardColPayload,
    DeleteBoardTaskPayload, RemoveTaskFileUpload,
    SortColumnsPayload, SortTasksPayload, TaskFileUpload,
    TaskSchema, TaskUpdateSchema
} from "../schemas/board.column.schema";
import {BoardDataService} from "../services/BoardDataService";
import {and, asc, eq, sql} from "drizzle-orm";
import {TaskType} from "../types/board.data.type";
import {NotificationActionTypesEnum, NotificationTypesEnum} from "../enums/NotificationTypesEnum";
import {Statuses} from "../enums/Statuses";
import {Priorities} from "../enums/Priorities";
import path from "node:path";
import fs from "node:fs";
import {IdParamSchema} from "../schemas/IdParamSchema";

export class BoardController {

    private boardDataService: BoardDataService;


    constructor(private context: AppContext) {
        this.boardDataService = new BoardDataService(this.context);
    }

    tasks = async (req: Request, res: Response) => {

        try {

            if (req.user?.companyId) {


                const boardData = await this.boardDataService.getTasks(req.user?.companyId)

                res.send(boardData);

            } else {
                res.status(500).json({error: "Failed to fetch board data"});
            }

        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to fetch board data"});
        }
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
                    pos: maxPos?.pos || 0,
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


                const [result] = await this.context.db.insert(tasks).values({
                    projectId: validatedData.projectId,
                    columnId: validatedData?.columnId,
                    title: validatedData.title,
                    description: validatedData?.description || "",
                    priority: validatedData?.priority || Priorities.MEDIUM,
                    dueDate: validatedData?.dueDate,
                }).$returningId();

                if (validatedData.assignee) {

                    await this.context.db.insert(taskMembers).values({
                        taskId: result.id,
                        userId: Number(validatedData.assignee)
                    });


                    await this.context.db.insert(notifications).values({
                        userId: Number(validatedData.assignee),
                        types: NotificationTypesEnum.TASK,
                        actionTypes: NotificationActionTypesEnum.CREATE,
                        message: `A new task has been assigned to you. (${validatedData.title})`,
                        objectId: result.id
                    });
                }

                const taskData = {
                    id: result.id,
                    projectId: validatedData.projectId,
                    columnId: validatedData?.columnId,
                    title: validatedData.title,
                    description: validatedData?.description || "",
                    priority: validatedData?.priority || Priorities.MEDIUM,
                    dueDate: validatedData?.dueDate || null,
                    assignee: []
                }


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

    updateTask = async (req: Request, res: Response) => {

        const validatedData = TaskUpdateSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                await this.context.db.transaction(async (trx: any) => {

                    const taskData: Omit<TaskType, "id" | "createdAt" | "status"> = {
                        projectId: Number(validatedData.projectId),
                        columnId: validatedData?.columnId,
                        title: validatedData.title,
                        description: validatedData.description,
                        priority: validatedData.priority,
                    }

                    const result = await trx.update(tasks).set(taskData).where(
                        and(
                            eq(tasks.projectId, validatedData.projectId),
                            eq(tasks.id, validatedData.id),
                            eq(tasks.columnId, validatedData.columnId),
                        )
                    );

                    if (validatedData.assignee?.length) {


                        await trx.delete(taskMembers).where(
                            eq(taskMembers.taskId, validatedData.id)
                        )

                        const addMembers = validatedData.assignee.map(async (assignee: any) => {


                            return await trx.insert(taskMembers).values({
                                taskId: validatedData.id,
                                userId: Number(assignee)
                            });
                        })

                        await Promise.all(addMembers)


                        await trx.delete(notifications).where(
                            and(
                                eq(notifications.objectId, validatedData.id),
                                eq(notifications.types, NotificationTypesEnum.TASK),
                                eq(notifications.actionTypes, NotificationActionTypesEnum.UPDATE),
                            )
                        )

                        const addNotifications = validatedData.assignee.map(async (assignee: any) => {


                            return await trx.insert(notifications).values({
                                userId: Number(assignee),
                                types: NotificationTypesEnum.TASK,
                                actionTypes: NotificationActionTypesEnum.UPDATE,
                                message: `Task (${validatedData.title}) has been changed`,
                                objectId: validatedData.id
                            });
                        })

                        await Promise.all(addNotifications)


                    }

                    return res.json(taskData);
                });

            } else {
                return res.status(500).json({error: "Failed to create profession"});
            }

        } catch (error) {
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create task"});
        }
    }

    deleteColumn = async (req: Request, res: Response) => {
        const validatedData = DeleteBoardColPayload.parse(req.body);

        try {

            // await this.context.db.delete(boardColumns).where(and(eq(boardColumns.projectId, validatedData.projectId), eq(boardColumns.id, validatedData.columnId)))
            await this.context.db.update(boardColumns).set({status: Statuses.ARCHIVED}).where(and(eq(boardColumns.projectId, validatedData.projectId), eq(boardColumns.id, validatedData.columnId)))

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

    sortTasks = async (req: Request, res: Response) => {
        const validatedData = SortTasksPayload.parse(req.body);

        try {

            await this.boardDataService.sortBoardColumnTasks(validatedData.columns || [], Number(validatedData?.draggedTaskId))

            res.status(200).json({})
        } catch (err) {
            console.error(err);

            res.status(500).json({error: "Failed to fetch professions"});
        }
    }

    file = async (req: Request, res: Response) => {

        const validatedData = TaskFileUpload.parse(req.body);

        const fileFolderPath = path.join(__dirname, '../../uploads/tasks');

        try {

            if (!fs.existsSync(fileFolderPath)) {
                fs.mkdirSync(fileFolderPath)
            }

            const name = req.file?.filename;
            const mimetype = req.file?.mimetype;
            const filePath = req.file?.path as string;

            const [member] = await this.context.db.select().from(users).where(eq(users.id, Number(req.user?.id)));

            if (member) {

                const newPath = path.join(__dirname, `../../uploads/tasks/${name}`);
                fs.rename(filePath, newPath, async (err) => {
                    if (!err) {

                        const fileUrl = `/uploads/tasks/${name}`
                        const [file] = await this.context.db.insert(taskFiles).values(
                            {
                                file: fileUrl,
                                taskId: validatedData.taskId,
                                fileType: mimetype,

                            }
                        ).$returningId();


                        res.json({
                            id: file.id,
                            file: fileUrl,
                            fileType: mimetype,
                            taskId: validatedData.taskId,

                        })
                    } else {
                        res.status(201).json({error: "Some thing went wrong"})
                    }
                })
            } else {
                res.status(201).json({error: "Some thing went wrong"})
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({error: "Failed to fetch professions"});
        }
    }

    removeTaskFile = async (req: Request, res: Response) => {

        const validatedData = RemoveTaskFileUpload.parse(req.body);


        try {


            if (req.user?.companyId) {


                const [file] = await this.context.db.select({...taskFiles})
                    .from(taskFiles)
                    .innerJoin(tasks, eq(tasks.id, taskFiles.taskId))
                    .innerJoin(projects, eq(projects.id, tasks.projectId))
                    .where(
                        and(
                            eq(projects.companyId, req.user?.companyId),
                            eq(taskFiles.taskId, validatedData.taskId),
                            eq(taskFiles.id, validatedData.fileId)
                        )
                    );

                if (file) {

                    const rootDir = process.cwd();
                    const filePath = path.join(rootDir, file.file)

                    //TODO check if user can remove the file
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }

                    await this.context.db.delete(taskFiles).where(
                        and(
                            eq(taskFiles.taskId, validatedData.taskId),
                            eq(taskFiles.id, validatedData.fileId)
                        )
                    );

                    res.status(200).json(file)

                }else{
                    res.status(500).json({error: "Failed to remove task file"});
                }



            } else {
                res.status(500).json({error: "Failed to remove task file"});
            }

        } catch (err) {
            console.log(err)
            res.status(500).json({error: "Failed to remove task file"});
        }
    }

    getFile = async (req: Request, res: Response) => {

        const {id} = IdParamSchema.parse(req.params);

        try {

            const taskFileList = await this.context.db.select().from(taskFiles).where(eq(taskFiles.taskId, Number(id)));

            res.json(taskFileList)

        } catch (err) {
            console.log(err)
            res.status(500).json({error: "Failed to fetch professions"});
        }
    }


}