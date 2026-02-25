import {z} from "zod";

export const SkillsSchema = z.object({
    id: z.int(),
    name: z.string(),
});