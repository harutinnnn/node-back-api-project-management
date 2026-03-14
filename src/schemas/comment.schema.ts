import {z} from "zod";

export const CommentEditSchema = z.object({
    id: z.int(),
    taskId: z.int(),
    content: z.string(),
});
export const CommentSchema = z.object({
    taskId: z.int(),
    content: z.string(),
});

export const TaskCommentSchema = z.object({
    taskId: z.int(),
});

