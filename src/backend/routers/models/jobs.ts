import { z } from 'zod';
import { db } from '../../data';
import { jobData } from '../../data/models/job';
import { Job } from '../../models/job';
import { procedure, router } from '../../trpc';

export const jobProcedures = router({
    /** Get a ticket */
    get: procedure
        .input(z.number())
        .query(async ({ input }) => {
            const job = await Job.findOne(o => o.id === input, ['deleted'])
            return { job }
        }),

    list: procedure
        .input(z.object({
            deleted: z.boolean().optional().nullable(),
        }).optional().nullable())
        .query(async ({ input }) => {
            if (input?.deleted) {
                return {
                    jobs: await Job.find(o => o?.deleted ? true : false, ['deleted']),
                }
            }
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
            console.log({ doc })
            for (const key in input) {
                if (key == 'id') { }
                else {
                    doc.set(key as any, input[key]);
                }
            }
            const job = await doc.save();
            return { job }
        }),

    delete: procedure
        .input(jobData.pick({ id: true }))
        .mutation(async ({ input }) => {
            await db.ready;
            const doc = new Job(input.id);
            if (doc) {
                doc.set('deleted', new Date());
                return { job: await doc.save() }
            }
            return { job: null }
        }),

    recover: procedure
        .input(jobData.pick({ id: true }))
        .mutation(async ({ input }) => {
            await db.ready;
            const doc = new Job(input.id);
            if (doc) {
                doc.set('deleted', null);
                return { job: await doc.save() }
            }
            return { job: null }
        })
})

