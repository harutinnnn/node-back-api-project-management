import {z} from "zod";


export const MemberSchema = z.object({
    name: z.string(),
    phone: z.string(),
    email: z.email(),
});
export const DeleteTaskSchema = z.object({
    id: z.int(),
});