import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {z, ZodError} from "zod";
import {db} from "./db";
import {users} from "./db/schema";
import jwt from "jsonwebtoken";
import {eq} from "drizzle-orm";
import passport from "./config/passport";
import {authenticateJWT} from "./middlewares/auth";
import bcrypt from "bcrypt";
import {createApp} from "./routes/app";
import {AppContext} from "./types/app.context.type";

dotenv.config();

const context: AppContext = {}
const app = createApp(context)

const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

app.use(passport.initialize());


app.get("/", (req: Request, res: Response) => {
    res.send("API is running!");
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
