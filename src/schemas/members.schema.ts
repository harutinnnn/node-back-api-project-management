import {z} from "zod";


export const MemberSchema = z.object({
    name: z.string(),
    phone: z.string(),
    email: z.email(),
    professionId: z.number(),
});