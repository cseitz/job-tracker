import { z } from 'zod';
import { modelData } from './_base';
import { Tags } from '../tags';


export const tagKeys: [(keyof typeof Tags)] = Object.keys(Tags) as any;

export type JobData = z.infer<typeof jobData>;
export const jobData = modelData.extend({
    title: z.string(),
    company: z.string(),
    applied: z.date().default(new Date()),
    status: z.enum(['pending', 'rejected', 'interview', 'offered', 'accepted', 'declined']).default('pending'),
    offer: z.string().optional(),
    link: z.string().optional(),
    tags: z.array(z.enum(tagKeys)).default([]),
})

