import { db } from '..';
import { procedure, router } from '../../trpc';
import { Model, baseModelData, modelData } from './_base';
import { z } from 'zod';


export type JobData = z.infer<typeof jobData>;
export const jobData = modelData.extend({
    title: z.string(),
})


export class Job extends Model({
    schema: jobData,
    collection: 'jobs'
}) {




}


// const uuh = new Job({ title: 'hi' }).get('id')

export const jobProcedures = router({
    list: procedure
        .query(async ({ input }) => {
            const jobs = await Job.find();
            return { jobs }
        }),

    create: procedure
        .input(jobData.omit({ id: true, created: true, updated: true }))
        .mutation(async ({ input }) => {
            const doc = new Job(input);
            const job = await doc.save();
            return { job }
        }),
})

