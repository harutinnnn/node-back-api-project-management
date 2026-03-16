import {StorageEngine} from "multer";
import {Socket} from "socket.io";

export type AppContext = {
    db: any
    storage: StorageEngine;
    socket?: Socket,
}