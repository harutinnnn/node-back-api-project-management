import {Statuses} from "../enums/Statuses";
import {Priorities} from "../enums/Priorities";

export type BoardDataType = {
    columns: ColumnInnerTaskIds[]
    tasks: TaskType[]
}

export type ColumnType = {
    id: number
    title: string
    pos: number
    projectId: number
    status: Statuses.ACTIVE | Statuses.ARCHIVED
    createdAt: Date | string
}

export type ColumnInnerTaskIds = {
    id: number
    title: string
    taskIds: number[]
    pos: number
}

export type ColumnInnerTaskIdsQuery = {
    id: number
    title: string
    taskIds: string
    pos: number
}

export type TaskType = {
    id: number
    title: string
    projectId: number
    columnId: number
    status: Statuses.PENDING | Statuses.DOING | Statuses.FOR_CHECK | Statuses.FINISHED | Statuses.CANCELED
    priority: Priorities,
    description: string,
    dueDate: Date | string
    createdAt: Date | string
}