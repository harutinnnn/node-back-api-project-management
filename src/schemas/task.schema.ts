import { z} from "zod";


export const TaskSchema = z.object({
    title: z.string(),
    projectId: z.int(),
    status: z.enum(['pending', 'doing', 'for_check', 'finished']),
    priority: z.enum(['urgent','high', 'medium', 'low']),
    description: z.string(),
    members: z.array(z.number()).optional(),
    files: z.array(z.number()).optional(),
});
export const DeleteTaskSchema = z.object({
    id: z.int(),
});