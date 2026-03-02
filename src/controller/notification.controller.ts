import {NextFunction, Request, Response} from "express";
import {notifications} from "../db/schema";
import {and, eq} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {IdParamSchema} from "../schemas/notificationsSchema";

export class NotificationController {


    constructor(private context: AppContext) {
    }

    index = async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (req.user?.id) {

                const notificationsData = await this.context.db
                    .select().from(notifications)
                    .where(
                        and(
                            eq(notifications.userId, Number(req.user?.id)),
                            eq(notifications.isRead, 0)
                        )
                    );

                res.json(notificationsData);

            } else {
                res.json({});
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Failed to fetch notifications"});
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {


        const validatedData = IdParamSchema.parse(req.body);

        try {

            if (validatedData.id && req.user?.id) {

                await this.context.db.update(notifications).set({isRead: 1}).where(
                    and(
                        eq(notifications.userId, Number(req.user?.id)),
                        eq(notifications.id, validatedData.id)
                    )
                )
                res.json({
                    id: validatedData.id,
                });
            } else {
                res.json({
                    id: 0,
                });
            }


        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Failed to fetch notifications"});
        }
    }
}