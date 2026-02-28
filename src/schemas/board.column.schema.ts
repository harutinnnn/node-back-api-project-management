import {z} from "zod";
import {BoardColumnStatuses} from "../enums/Statuses";
import {Priorities} from "../enums/Priorities";

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
    description: z.string(),
    priority: z.enum(Priorities),
    assignee: z.int().optional(),
    dueDate: z.date().optional(),
    tags: z.array(z.string()),
});