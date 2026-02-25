import {NextFunction, Request, Response} from "express";
import { projects} from "../db/schema";
import {eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";

export class TaskController {


    constructor(private context: AppContext) {
    }


    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            const projectsList = await this.context.db.select().from(projects);
            res.json(projectsList);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }

    create = async (req: Request, res: Response) => {


        console.log(req.files);
        console.log(req.body);

        // const validatedData = TaskSchema.parse(req.body);

        //todo handle files

        // console.log(validatedData);


        try {



            res.json({});
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }


    delete = async (req: Request, res: Response) => {

        const validatedData = IdParamSchema.parse(req.body);

        try {
            await this.context.db.delete(projects).where(eq(projects.id, validatedData.id))

            console.log('validatedData.id', validatedData.id)
            res.json({});

        } catch (error) {

            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}