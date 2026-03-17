import dotenv from "dotenv";
import {db} from "./db";
import {createApp} from "./routes/app";
import {AppContext} from "./types/app.context.type";
import {storage} from "./config/storage";

import {Server, Socket} from "socket.io";
import {socketApp} from "./socket/socket";
import passport from "./config/passport";

dotenv.config();

const context: AppContext = {
    db: db,
    storage: storage,
    socketUsers: [],

}

const app = createApp(context)

const io: Server = new Server(app, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

context.io = io;

io.use((socket, next) => {
    const request = socket.request as any;
    const tokenFromAuth = socket.handshake.auth?.token as string | undefined;

    if (!request.headers.authorization && tokenFromAuth) {
        request.headers.authorization = tokenFromAuth.startsWith("Bearer ")
            ? tokenFromAuth
            : `Bearer ${tokenFromAuth}`;
    }

    passport.authenticate("jwt", {session: false}, (error: unknown, user: Express.User | false) => {
        if (error || !user) {
            return next(new Error("Unauthorized"));
        }

        socket.data.user = user;
        request.user = user;

        return next();
    })(request, {} as any, next as any);
});

io.on("connection", socket => {

    const user = socket.data.user as Express.User | undefined;

    if (user?.id) {
        if (!context.socketUsers.find(sU => sU.userId === user?.id)) {


            context.socketUsers.push(
                {
                    userId: user.id,
                    socketId: socket.id

                }
            );
        }
    }

    console.log('connected')
    context.socket = socket
    socketApp(context)
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
