import {NextFunction, Request, Response} from "express";
import { projects} from "../db/schema";
import {eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";

export class TaskController {


    constructor(private context: AppContext) {
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            const projectsList = await this.context.db.select().from(projects);
            res.json(projectsList);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }

    /**
     * @param req
     * @param res
     */
    create = async (req: Request, res: Response) => {

        try {
            res.json({});
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

    /**
     * @param req
     * @param res
     */
    delete = async (req: Request, res: Response) => {

        const validatedData = IdParamSchema.parse(req.body);

        try {

            await this.context.db.delete(projects).where(eq(projects.id, validatedData.id))
            res.json({});
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}