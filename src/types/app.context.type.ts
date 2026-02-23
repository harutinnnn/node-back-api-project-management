import {StorageEngine} from "multer";

export type AppContext = {
    db: any
    storage: StorageEngine;
}