import {NextFunction, Request, Response} from "express";
import {db} from "../db";
import {projectMembers, projects, users} from "../db/schema";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";
import {DeleteProjectSchema, ProjectSchema} from "../schemas/project.schema";
import {TaskSchema} from "../schemas/task.schema";

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

            // const result = await this.context.db.insert(projects).values({
            //     title: validatedData.title,
            //     description: validatedData.description,
            // });
            //
            // const lid: number = result[0].insertId;
            //
            //
            // this.context.db.delete(projectMembers).where(eq(projectMembers.projectId, lid))
            //
            // if (lid && validatedData.members?.length) {
            //
            //     validatedData.members.forEach(async (member) => {
            //
            //         const projectMember = await this.context.db.insert(projectMembers).values({
            //             projectId: lid,
            //             userId: member,
            //         });
            //
            //         // console.log(projectMember);
            //
            //     })
            //
            //
            // }


            res.json({});
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }


    delete = async (req: Request, res: Response) => {

        const validatedData = DeleteProjectSchema.parse(req.body);

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