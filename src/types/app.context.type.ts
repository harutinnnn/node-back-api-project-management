import {StorageEngine} from "multer";
import {Server, Socket} from "socket.io";

export type AppContext = {
    db: any
    storage: StorageEngine;
    socket?: Socket,
    io?: Server ;
    socketUsers: {
        userId: number
        socketId: string
    }[]
}