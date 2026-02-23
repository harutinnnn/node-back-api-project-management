import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {db} from "./db";
import passport from "./config/passport";
import {createApp} from "./routes/app";
import {AppContext} from "./types/app.context.type";
import {storage} from "./config/storage";
import multer from "multer";

dotenv.config();

const context: AppContext = {
    db:db,
    storage:storage
}

const app = createApp(context)

const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

app.use(passport.initialize());


app.get("/", (req: Request, res: Response) => {
    res.send("API is running!");
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});


app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    console.log(req.file)
    res.json({
        message: "File uploaded successfully",
        file: {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
        },
    });
});

app.post("/uploads", upload.array("files", 5), (req, res) => {
    if (!req.files) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    res.json({
        message: "Files uploaded successfully",
        files: req.files,
    });
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
