import {z} from "zod";
import {BoardColumnStatuses} from "../enums/Statuses";
import {Priorities} from "../enums/Priorities";

export const BoardSchema = z.object({
    projectId: z.int(),
});

export const BoardColumnSchema = z.object({
    id: z.int().optional(),
    projectId: z.int(),
    title: z.string(),
    pos: z.string().optional(),
    status: z.enum(BoardColumnStatuses).optional(),
});

export const TaskSchema = z.object({
    id: z.int().optional(),
    title: z.string(),
    projectId: z.int().optional(),
    columnId: z.int(),
    description: z.string().optional(),
    priority: z.enum(Priorities).optional(),
    assignee: z.int().optional(),
    dueDate: z.date().optional()
});

export const TaskUpdateSchema = z.object({
    id: z.int(),
    title: z.string(),
    projectId: z.int(),
    columnId: z.int(),
    description: z.string(),
    priority: z.enum(Priorities),
    assignee: z.array(z.int()).optional(),
    dueDate: z.date().or(z.string()).or(z.null()).optional()
});

export const SortColumnsPayload = z.object({
    projectId: z.int(),
    columns: z.array(z.number()).optional(),
});

export const TaskFileUpload = z.object({
    taskId: z.coerce.number()
});


export const SortTasksPayload = z.object({
    draggedTaskId: z.int().optional(),
    projectId: z.int(),
    columns: z.array(
        z.object({
            columnId: z.int(),
            taskIds: z.array(z.number()),
        })
    ),
});


export const DeleteBoardTaskPayload = z.object({
    taskId: z.int(),
    columnId: z.int(),
})

export const DeleteBoardColPayload = z.object({
    columnId: z.int(),
    projectId: z.int(),
});