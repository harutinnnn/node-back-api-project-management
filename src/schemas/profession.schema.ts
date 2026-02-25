import {z} from "zod";

export const ProfessionSchema = z.object({
    id: z.int().optional(),
    name: z.string(),
});