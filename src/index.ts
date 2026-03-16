import dotenv from "dotenv";
import {db} from "./db";
import {createApp} from "./routes/app";
import {AppContext} from "./types/app.context.type";
import {storage} from "./config/storage";

import {Server, Socket} from "socket.io";
import {socketApp} from "./socket/socket";

dotenv.config();

const context: AppContext = {
    db: db,
    storage: storage
}

const app = createApp(context)


const io = new Server(app, {
    cors: {origin: "*"}
});


io.on("connection", socket => {
    console.log('connected')
    context.socket = socket
    socketApp(context)
})


const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
