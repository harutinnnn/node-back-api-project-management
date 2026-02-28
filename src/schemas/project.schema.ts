import {z} from "zod";
import {ProjectStatuses} from "../enums/Statuses";

export const ProjectSchema = z.object({
    id: z.int().optional(),
    title: z.string(),
    description: z.string(),
    status: z.enum(ProjectStatuses),
});