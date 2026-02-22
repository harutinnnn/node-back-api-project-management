import {number, z} from "zod";


export const ProjectSchema = z.object({
    title: z.string(),
    description: z.string(),
    members: z.array(z.number()).optional(),
});
export const DeleteProjectSchema = z.object({
    id: z.int(),
});