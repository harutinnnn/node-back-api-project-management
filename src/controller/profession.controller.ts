import {NextFunction, Request, Response} from "express";
import {and, eq, ne, not} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {professions} from "../db/schema";
import {ProfessionSchema} from "../schemas/profession.schema";

export class ProfessionController {


    constructor(private context: AppContext) {
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