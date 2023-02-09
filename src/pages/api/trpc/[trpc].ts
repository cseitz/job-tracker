import * as trpcNext from '@trpc/server/adapters/next';
import { apiRouter } from '../../../backend/routers/_main';
import { NextApiRequest, NextApiResponse } from 'next';
import { TRPCError } from '@trpc/server';


const trpc = trpcNext.createNextApiHandler({
    router: apiRouter,
    createContext: ({ req, res }) => {
        if ('reject' in req) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: `Authorization required; document.cookie = "jobAuth=[SECRET]"`
            })
        }
        return {}
    },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log(req.headers, req.url, req.cookies);
    //  && !req.headers.host?.includes('localhost')
    if (process.env.SECRET) {
        if (!('jobAuth' in req.cookies) || req.cookies['jobAuth'] !== process.env.SECRET) {
            // @ts-ignore
            req.reject = true;
        }
    }
    return trpc(req, res);
}

