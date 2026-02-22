import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {db} from "./db";
import passport from "./config/passport";
import {createApp} from "./routes/app";
import {AppContext} from "./types/app.context.type";

dotenv.config();

const context: AppContext = {
    db:db
}
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
