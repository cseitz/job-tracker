import * as trpcNext from '@trpc/server/adapters/next';
import { apiRouter } from '../../../backend/routers/_main';


export default trpcNext.createNextApiHandler({
    router: apiRouter,
    createContext: () => ({}),
});

