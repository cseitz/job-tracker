import { z } from 'zod';


export type BaseModelData = z.infer<typeof baseModelData>;
export const baseModelData = z.object({
    id: z.number(),
    updated: z.date(),
    created: z.date(),
    deleted: z.date().optional().nullable(),
})

export const modelData = baseModelData;
