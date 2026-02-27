import {z} from "zod";
import {Gender} from "../enums/Gender";

export const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string("Phone email address"),
    gender: z.enum(Gender),
    professionId: z.number(),
    skills: z.array(z.number()).optional(),
});