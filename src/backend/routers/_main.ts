import { jobProcedures } from '../data/models/job';
import { procedure, router } from '../trpc';


export type ApiRouter = typeof apiRouter;
export const apiRouter = router({
    ping: procedure
        .query(() => {
            return { date: new Date() }
        }),
    jobs: jobProcedures,
})

