import {z} from "zod";
import {Gender} from "../enums/Gender";


export const MemberSchema = z.object({
    name: z.string(),
    phone: z.string(),
    email: z.email(),
    gender: z.enum(Gender),
    professionId: z.number(),
});