import {NextFunction, Request, Response} from "express";
import {and, eq, ne, not} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {projects} from "../db/schema";
import {ProjectSchema} from "../schemas/project.schema";

export class ProjectController {


    constructor(private context: AppContext) {
    }

    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            if (req.user?.companyId) {


                const result = await this.context.db.select().from(projects).where(eq(projects.companyId, req.user?.companyId));
                res.json(result);

            } else {
                res.json([]);
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch projects"});
        }

    }


    get = async (req: Request, res: Response, next: NextFunction) => {

        const {id} = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {

                const [project] = await this.context.db.select().from(projects).where(and(eq(projects.id, id), eq(projects.companyId, req.user.companyId)));
                return res.json(project);

            } else {
                return res.status(400).json({error: "Email and password are required"});
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }

    create = async (req: Request, res: Response) => {

        const validatedData = ProjectSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                if (validatedData.id) {

                    const title = validatedData.title;
                    const status = validatedData.status;
                    const description = validatedData.description;

                    const [project] = await this.context.db.select().from(projects).where(and(eq(projects.companyId, req.user.companyId), eq(projects.title, validatedData.title), ne(projects.id, validatedData.id)));

                    if (!project) {

                       const a = await this.context.db.update(projects).set({
                            title,
                            description,
                            status,
                        }).where(and(eq(projects.companyId, req.user?.companyId), eq(projects.id, validatedData.id)));

                        return res.json({
                            id: validatedData.id,
                        });

                    } else {
                        return res.status(201).json({
                            error: "Project already exists",
                        });
                    }

                } else {

                    const [project] = await this.context.db.select().from(projects).where(and(eq(projects.companyId, req.user.companyId), eq(projects.title, validatedData.title)));

                    if (!project) {

                        const result = await this.context.db.insert(projects).values({
                            title: validatedData.title,
                            status: validatedData.status,
                            description: validatedData.description,
                            companyId: req.user?.companyId,
                            progress: 0,
                        }).$returningId();

                        return res.json({
                            id: result[0].id,
                        });

                    } else {
                        return res.status(201).json({
                            error: "Project already exists",
                        });
                    }

                }

            } else {
                return res.status(500).json({error: "Failed to create project"});
            }

        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            console.log(req)
            res.status(500).json({error: "Failed to create member"});
        }
    }


    delete = async (req: Request, res: Response) => {

        const validatedData = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {
                await this.context.db.delete(projects).where(and(eq(projects.id, validatedData.id), eq(projects.companyId, req.user.companyId)));
                res.json({id: validatedData.id});

            } else {
                res.status(500).json({error: "Failed to delete project"});
            }
        } catch (error) {

            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}