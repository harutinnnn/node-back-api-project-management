import {z} from "zod";

export const MessageEditSchema = z.object({
    senderId:z.int(),
    receiverId: z.int(),
    message: z.string(),
});
export const MemberMessagesSchema = z.object({
    memberId: z.int(),
});

export const TaskCommentSchema = z.object({
    taskId: z.int(),
});

