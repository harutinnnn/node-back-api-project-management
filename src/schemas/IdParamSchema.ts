import {z} from "zod";

export const IdParamSchema = z.object({
    id: z.coerce.number(),
});
export const TokenParamSchema = z.object({
    token: z.string(),
});