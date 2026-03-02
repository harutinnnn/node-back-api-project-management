import {NextFunction, Request, Response} from "express";
import {memberSkills, notifications, skills, users} from "../db/schema";
import {and, eq, inArray} from "drizzle-orm";
import {AppContext} from "../types/app.context.type";
import {UserType} from "../types/user.type";
import {SkillType} from "../types/skill.type";

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

                res.json({
                    notifications: notificationsData
                });

            } else {
                res.json({});
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Failed to fetch notifications"});
        }

    }
}