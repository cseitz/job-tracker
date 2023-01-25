import { z } from 'zod';
import { modelData } from './_base';


export type JobData = z.infer<typeof jobData>;
export const jobData = modelData.extend({
    title: z.string(),
    company: z.string(),
    applied: z.date().default(new Date()),
    status: z.enum(['pending', 'rejected', 'interview', 'offered', 'accepted', 'declined']).default('pending'),
    offer: z.string().optional(),
})





// const uuh = new Job({ title: 'hi' }).get('id')
