import {number, z} from "zod";


export const ProjectSchema = z.object({
    title: z.string(),
    description: z.string(),
    members: z.array(z.number()).optional(),
});