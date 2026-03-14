import {NextFunction, Request, Response} from "express";
import {projects, taskComments, users} from "../db/schema";
import {and, desc, eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {CommentEditSchema, CommentSchema, TaskCommentSchema} from "../schemas/comment.schema";

export class CommentController {


    constructor(private context: AppContext) {
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    index = async (req: Request, res: Response, next: NextFunction) => {

        try {


            const validatedData = TaskCommentSchema.parse(req.body);

            const comments = await this.context.db
                .select({...taskComments, name: users.name})
                .from(taskComments)
                .leftJoin(users, eq(taskComments.userId, users.id))
                .where(eq(taskComments.taskId, validatedData.taskId)).orderBy(desc(taskComments.createdAt));
            res.json(comments);
        } catch (error) {

            console.error(error);
            res.status(500).json({error: "Failed to fetch users"});
        }
    }

    /**
     * @param req
     * @param res
     */
    create = async (req: Request, res: Response) => {

        try {

            const validatedData = CommentSchema.parse(req.body);

            if (req.user?.id) {


                const [result] = await this.context.db.insert(taskComments).values({
                    taskId: validatedData.taskId,
                    userId: req.user?.id,
                    content: validatedData.content,
                }).$returningId();


                //TODO set notification

                res.json({id: result.id});

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

    /**
     * @param req
     * @param res
     */
    edit = async (req: Request, res: Response) => {

        try {

            const validatedData = CommentEditSchema.parse(req.body);

            if (req.user?.id) {

                console.log('validatedData',validatedData)

                const [comment] = await this.context.db.select().from(taskComments).where(and(
                    eq(taskComments.id, validatedData.id),
                    eq(taskComments.userId, req.user?.id)
                ));

                if (comment) {

                    console.log(comment);


                    const result = await this.context.db.update(taskComments).set({
                        content: validatedData.content,
                    }).where(eq(taskComments.id, validatedData.id));

                    console.log(result);

                    //TODO set notification

                    res.json({id: result.id});

                } else {

                    res.status(500).json({error: "Failed to edit comment"});

                }

            } else {
                res.status(500).json({error: "Failed to edit comment"});
            }
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


        const validatedData = IdParamSchema.parse(req.params);


        try {

            await this.context.db.delete(taskComments).where(eq(taskComments.id, validatedData.id))
            res.json({id: validatedData.id});
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                console.error('Error: ' + error.message);
            }
            res.status(500).json({error: "Failed to create project"});
        }
    }

}