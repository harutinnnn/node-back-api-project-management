import {NextFunction, Request, Response} from "express";
import {projectMembers, projects} from "../db/schema";
import {eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {ProjectSchema} from "../schemas/project.schema";
import {IdParamSchema} from "../schemas/IdParamSchema";

export class ProjectController {


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

        const validatedData = ProjectSchema.parse(req.body);


        try {

            const result = await this.context.db.insert(projects).values({
                title: validatedData.title,
                description: validatedData.description,
            });

            const lid: number = result[0].insertId;


            this.context.db.delete(projectMembers).where(eq(projectMembers.projectId, lid))

            if (lid && validatedData.members?.length) {

                validatedData.members.forEach(async (member) => {

                    const projectMember = await this.context.db.insert(projectMembers).values({
                        projectId: lid,
                        userId: member,
                    });

                    // console.log(projectMember);

                })


            }


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