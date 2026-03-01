import {NextFunction, Request, Response} from "express";
import {and, eq, inArray, ne, not} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {boardColumns, professions, projects, tasks} from "../db/schema";
import {ProfessionSchema} from "../schemas/profession.schema";
import {BoardColumnSchema, BoardSchema, SortColumnsPayload, TaskSchema} from "../schemas/board.column.schema";
import {ColumnInnerTaskIds} from "../interfaces/ColumnInnerTaskIds";

export class BoardController {


    constructor(private context: AppContext) {
    }


    getBoardData = async (req: Request, res: Response) => {

        const validatedData = BoardSchema.parse(req.body);


        if (req.user?.companyId) {

            try {


                const project = await this.context.db.select().from(projects).where(and(eq(projects.id, validatedData.projectId), eq(projects.companyId, req.user?.companyId)));
                if (project) {
                    const columns = await this.context.db.select().from(boardColumns).where(eq(boardColumns.projectId, validatedData.projectId));


                    if (columns) {

                        const columnInnerTaskIds: ColumnInnerTaskIds[] = []

                        const columnIds = columns.map(column => column.id);

                        let tasksData: any[] = [];

                        if (columnIds.length) {
                            tasksData = await this.context.db.select().from(tasks).where(inArray(tasks.columnId, columnIds));


                            columns.map(column => {

                                const colTmpData: ColumnInnerTaskIds = {
                                    id: column.id,
                                    title: column.title,
                                    taskIds: tasksData.filter(task => task.columnId === column.id).map(task => task.id),
                                    pos: column.pos
                                }
                                columnInnerTaskIds.push(colTmpData);
                            })
                        }

                        res.status(200).send({
                            // project: project,
                            columns: columnInnerTaskIds,
                            tasks: tasksData
                        });

                    } else {
                        res.status(500).json({error: "Failed to fetch board data"});
                    }

                } else {
                    res.status(500).json({error: "Failed to fetch board data"});
                }


            } catch (err) {
                console.error(err);
                res.status(500).json({error: "Failed to fetch board data"});
            }

        } else {
            res.status(500).json({error: "Failed to fetch board data"});
        }
    }

    createColumn = async (req: Request, res: Response) => {

        const validatedData = BoardColumnSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                const result = await this.context.db.insert(boardColumns).values({
                    title: validatedData.title,
                    companyId: req.user?.companyId,
                    projectId: validatedData.projectId,
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

    sortColumn = async (req: Request, res: Response) => {
        const validatedData = SortColumnsPayload.parse(req.body);

        try {

            validatedData.columns?.map(async (col, index) => {
                const pos = index + 1
                await this.context.db.update(boardColumns).set({pos}).where(and(eq(boardColumns.projectId, Number(validatedData.projectId)), eq(boardColumns.id, col)));
            })


            res.status(200).json({})
        } catch (err) {
            res.status(500).json({error: "Failed to fetch professions"});
        }
    }

    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            if (req.user?.companyId) {


                const result = await this.context.db.select().from(professions).where(eq(professions.companyId, req.user?.companyId));
                res.json(result);

            } else {
                res.json([]);
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch professions"});
        }

    }


    get = async (req: Request, res: Response, next: NextFunction) => {

        const {id} = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {

                const [profession] = await this.context.db.select().from(professions).where(and(eq(professions.id, id), eq(professions.companyId, req.user.companyId)));
                return res.json(profession);

            } else {
                return res.status(400).json({error: "Email and password are required"});
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }


    /**
     * @param req
     * @param res
     */
    create = async (req: Request, res: Response) => {


        const validatedData = ProfessionSchema.parse(req.body);
        console.log('validatedData', validatedData)

        try {

            if (req.user?.companyId) {


                if (validatedData.id) {

                    const name = validatedData.name;

                    const [profession] = await this.context.db.select().from(professions).where(and(eq(professions.companyId, req.user.companyId), eq(professions.name, validatedData.name), ne(professions.id, validatedData.id)));

                    if (!profession) {


                        await this.context.db.update(professions).set({name}).where(and(eq(professions.companyId, req.user?.companyId), eq(professions.id, validatedData.id)));

                        return res.json({
                            id: validatedData.id,
                        });

                    } else {
                        return res.status(201).json({
                            error: "Profession already exists",
                        });
                    }

                } else {

                    const [profession] = await this.context.db.select().from(professions).where(and(eq(professions.companyId, req.user.companyId), eq(professions.name, validatedData.name)));

                    if (!profession) {

                        const result = await this.context.db.insert(professions).values({
                            name: validatedData.name,
                            companyId: req.user?.companyId,
                        }).$returningId();

                        return res.json({
                            id: result[0].id,
                        });

                    } else {
                        return res.status(201).json({
                            error: "Profession already exists",
                        });
                    }

                }

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


    delete = async (req: Request, res: Response) => {

        const validatedData = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {
                await this.context.db.delete(professions).where(and(eq(professions.id, validatedData.id), eq(professions.companyId, req.user.companyId)));
                res.json({id: validatedData.id});

            } else {
                res.status(500).json({error: "Failed to create project"});
            }
        } catch (error) {

            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}