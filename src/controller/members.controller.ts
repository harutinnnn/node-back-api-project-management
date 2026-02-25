import {NextFunction, Request, Response} from "express";
import {db} from "../db";
import {projectMembers, projects, users} from "../db/schema";
import {and, eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";
import {ProjectSchema} from "../schemas/project.schema";
import {TaskSchema} from "../schemas/task.schema";
import {MemberSchema} from "../schemas/members.schema";
import {UserRoles} from "../enums/UserRoles";
import {IdParamSchema} from "../schemas/IdParamSchema";

export class MembersController {


    constructor(private context: AppContext) {
    }


    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            if (req.user?.companyId) {


                const members = await this.context.db.select().from(users).where(eq(users.companyId, req.user?.companyId));
                res.json(members);
            } else {
                res.json([]);
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }

    }


    get = async (req: Request, res: Response, next: NextFunction) => {


        const {id} = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {

                const [member] = await this.context.db.select().from(users).where(and(eq(users.id, id), eq(users.companyId, req.user.companyId)));
                delete member.password;
                return res.json(member);

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


        const validatedData = MemberSchema.parse(req.body);

        try {

            const [user] = await this.context.db.select().from(users).where(eq(users.email, validatedData.email));

            if (!user) {


                console.log('validatedData',validatedData)
                const hashedPassword = await bcrypt.hash(Date.now().toString(), 10);

                const result = await this.context.db.insert(users).values({
                    name: validatedData.name,
                    email: validatedData.email,
                    phone: validatedData.phone,
                    companyId: req.user?.companyId,
                    professionId: validatedData.professionId,
                    role: UserRoles.USER,
                    password: hashedPassword

                }).$returningId();

                res.json({
                    id: result[0].id,
                });

            } else {

                res.status(201).json({error: "Email already used!"});

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

        const validatedData = IdParamSchema.parse(req.body);

        try {

            if (req.user?.companyId) {

                await this.context.db.delete(users).where(and(eq(users.id, validatedData.id), eq(users.companyId, req.user?.companyId)))

                res.json({});
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