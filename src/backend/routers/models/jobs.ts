import { db } from '../../data';
import { jobData } from '../../data/models/job';
import { Job } from '../../models/job';
import { procedure, router } from '../../trpc';

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

    update: procedure
        .input(jobData.pick({ id: true }).merge(jobData.omit({ id: true, created: true, updated: true }).partial()))
        .mutation(async ({ input }) => {
            await db.ready;
            const doc = new Job(input.id);
            for (const key in input) {
                if (key == 'id') { }
                else {
                    doc.set(key as any, input[key]);
                }
            }
            const job = await doc.save();
            return { job }
        }),

    remove: procedure
        .input(jobData.pick({ id: true }))
        .mutation(async ({ input }) => {

        })
})

