import {NextFunction, Request, Response} from "express";
import {messages, notifications, taskComments, users} from "../db/schema";
import {and, asc, desc, eq, or} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {CommentEditSchema, CommentSchema, TaskCommentSchema} from "../schemas/comment.schema";
import {MemberMessagesSchema, MessageEditSchema} from "../schemas/message.schema";
import {alias} from "drizzle-orm/mysql-core";
import {NotificationActionTypesEnum, NotificationTypesEnum} from "../enums/NotificationTypesEnum";

export class MessageController {


    constructor(private context: AppContext) {
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    index = async (req: Request, res: Response, next: NextFunction) => {

        try {


            const validatedData = MemberMessagesSchema.parse(req.body);

            const sender = alias(users, "sender");
            const receiver = alias(users, "receiver");

            const messagesList = await this.context.db
                .select({
                    message: messages,
                    sender: sender,
                    receiver: receiver
                })
                .from(messages)
                .leftJoin(sender, eq(messages.senderId, sender.id))
                .leftJoin(receiver, eq(messages.receiverId, receiver.id))
                .where(or(
                    and(
                        eq(messages.senderId, Number(req.user?.id)),
                        eq(messages.receiverId, validatedData.memberId)
                    ),
                    and(
                        eq(messages.senderId, validatedData.memberId),
                        eq(messages.receiverId, Number(req.user?.id))
                    )
                ))
                .orderBy(desc(messages.createdAt)).limit(10);

           await  this.context.db.update(messages).set({isRead: 1}).where(
                and(
                    eq(messages.receiverId, Number(req.user?.id)),
                    eq(messages.senderId, validatedData.memberId)
                ),
            )

            res.json(messagesList.reverse());
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

            const validatedData = MessageEditSchema.parse(req.body);

            if (req.user?.id && req.user.companyId) {


                const [result] = await this.context.db.insert(messages).values({
                    companyId: req.user.companyId,
                    senderId: req.user?.id,
                    receiverId: validatedData.receiverId,
                    message: validatedData.message,
                }).$returningId();


                //TODO set notification
                const [notification] = await this.context.db.select().from(notifications).where(
                    and(
                        eq(notifications.userId, Number(validatedData.receiverId)),
                        eq(notifications.types, NotificationTypesEnum.MESSAGE),
                        eq(notifications.isRead, 0),
                    )
                );

                if (!notification) {

                    await this.context.db.insert(notifications).values({
                        userId: Number(validatedData.receiverId),
                        types: NotificationTypesEnum.MESSAGE,
                        actionTypes: NotificationActionTypesEnum.CREATE,
                        message: `${req.user?.name} send message!`,
                        objectId: result.id,
                        json: JSON.stringify({
                            senderId: validatedData.senderId,
                        }),
                    });
                }

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

                const [comment] = await this.context.db.select().from(taskComments).where(and(
                    eq(taskComments.id, validatedData.id),
                    eq(taskComments.userId, req.user?.id)
                ));

                if (comment) {

                    const result = await this.context.db.update(taskComments).set({
                        content: validatedData.content,
                    }).where(eq(taskComments.id, validatedData.id));

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