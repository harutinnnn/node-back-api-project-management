import {Request, Response} from "express";
import {db} from "../db";
import {users} from "../db/schema";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";

export class UserController {


    constructor(private context: AppContext) {
    }


    index = async (req: Request, res: Response) => {

        try {
            const allUsers = await db.select().from(users);
            res.json(allUsers);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }

}