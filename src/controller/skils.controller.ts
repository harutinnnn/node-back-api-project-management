import {NextFunction, Request, Response} from "express";
import {skills, users} from "../db/schema";
import {eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {MemberSchema} from "../schemas/members.schema";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {SkillsSchema} from "../schemas/skills.schema";

export class SkillsController {


    constructor(private context: AppContext) {
    }

    index = async (req: Request, res: Response, next: NextFunction) => {

        try {
            if (req.user?.companyId) {


                const result = await this.context.db.select().from(skills).where(eq(skills.companyId, req.user?.companyId));
                res.json(result);

            } else {
                res.json([]);
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch skills"});
        }

    }


    get = async (req: Request, res: Response, next: NextFunction) => {

        const {id} = IdParamSchema.parse(req.params);

        try {
            if (req.user?.companyId) {

                const [skill] = await this.context.db.select().from(skills).where(eq(users.id, id), eq(skills.companyId, req.user.companyId));
                return res.json(skill);

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


        const validatedData = SkillsSchema.parse(req.body);

        try {

            if (req.user?.companyId) {


                const result = await this.context.db.insert(skills).values({
                    name: validatedData.name,
                    companyId: req.user?.companyId,
                }).$returningId();

                return res.json({
                    id: result[0].id,
                });

            } else {
                return res.status(500).json({error: "Failed to create skill"});
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
            await this.context.db.delete(skills).where(eq(skills.id, validatedData.id))
            res.json({});

        } catch (error) {

            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}