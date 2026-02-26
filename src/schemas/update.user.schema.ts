import {z} from "zod";

export const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string("Phone email address"),
    professionId: z.number(),
    skills: z.array(z.number()).optional(),
});