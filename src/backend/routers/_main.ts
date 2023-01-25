import { procedure, router } from '../trpc';
import { jobProcedures } from './models/jobs';


export type ApiRouter = typeof apiRouter;
export const apiRouter = router({
    ping: procedure
        .query(() => {
            return { date: new Date() }
        }),
    jobs: jobProcedures,
})

