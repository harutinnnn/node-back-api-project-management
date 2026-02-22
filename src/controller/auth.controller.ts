import {Request, Response} from "express";
import {users} from "../db/schema";
import {eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";

export class AuthController {


    constructor(private context: AppContext) {
    }

    register = async (req: Request, res: Response) => {
        try {
            const validatedData = UserSchema.parse(req.body);

            // Check if user already exists
            const [existingUser] = await this.context.db.select().from(users).where(eq(users.email, validatedData.email));
            if (existingUser) {
                return res.status(400).json({error: "User with this email already exists"});
            }

            const hashedPassword = await bcrypt.hash(validatedData.password, 10);

            await this.context.db.insert(users).values({...validatedData, password: hashedPassword});

            // Fetch newly created user
            const [newUser] = await this.context.db.select().from(users).where(eq(users.email, validatedData.email));

            const payload = {id: newUser.id, email: newUser.email};
            const token = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "15m"});
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "default_refresh_secret", {expiresIn: "7d"});

            // Save refresh token to db
            await this.context.db.update(users).set({refreshToken}).where(eq(users.id, newUser.id));

            res.status(201).json({
                token,
                refreshToken,
                user: {id: newUser.id, name: newUser.name, email: newUser.email}
            });
        } catch (error) {
            console.log(error);
            if (error instanceof ZodError) {
                res.status(400).json({error: (error as any).errors});
            } else {
                res.status(500).json({error: "Failed to register user"});
            }
        }

    }


    login = async (req: Request, res: Response) => {

        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({error: "Email and password are required"});
        }

        try {
            const [user] = await this.context.db.select().from(users).where(eq(users.email, email));
            if (!user) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const payload = {id: user.id, email: user.email};
            const token = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "15m"});
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "default_refresh_secret", {expiresIn: "7d"});

            // Save refresh token to db
            await this.context.db.update(users).set({refreshToken}).where(eq(users.id, user.id));

            res.json({token, refreshToken, user: {id: user.id, name: user.name, email: user.email}});
        } catch (error) {
            res.status(500).json({error: "Login failed"});
        }
    }

    refresh = async (req: Request, res: Response) => {

        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(401).json({error: "Refresh token is required"});
        }

        try {
            // Verify refresh token signature
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "default_refresh_secret") as {
                id: number,
                email: string
            };

            // Verify it matches user in database
            const [user] = await this.context.db.select().from(users).where(eq(users.id, decoded.id));

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({error: "Invalid refresh token"});
            }

            // Generate new short-lived access token
            const payload = {id: user.id, email: user.email};
            const newToken = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "15m"});

            res.json({token: newToken});
        } catch (error) {
            return res.status(403).json({error: "Invalid or expired refresh token"});
        }


    }

    logout = async (req: Request, res: Response) => {
        try {
            const userId = (req.user as any).id;

            // Remove the refresh token from the database
            await this.context.db.update(users).set({refreshToken: null}).where(eq(users.id, userId));

            res.json({message: "Logged out successfully"});
        } catch (error) {
            res.status(500).json({error: "Logout failed"});
        }
    }

}