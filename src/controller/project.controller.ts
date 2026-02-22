import {Request, Response} from "express";
import {db} from "../db";
import {projectMembers, projects, users} from "../db/schema";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";
import {ProjectSchema} from "../schemas/project.schema";

export class ProjectController {


    constructor(private context: AppContext) {
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

}