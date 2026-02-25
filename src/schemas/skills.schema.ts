import {z} from "zod";

export const SkillsSchema = z.object({
    name: z.string(),
});