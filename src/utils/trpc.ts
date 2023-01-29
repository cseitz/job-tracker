import { createTRPCProxyClient, httpBatchLink, httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { ApiRouter } from '../backend/trpc';
import SuperJSON from 'superjson';
import { create } from 'zustand';
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared';
import get from 'lodash/get';


function getBaseUrl() {
    if (typeof window !== 'undefined')
        // browser should use relative path
        return '';
    if (process.env.VERCEL_URL)
        // reference for vercel.com
        return `https://${process.env.VERCEL_URL}`;
    if (process.env.RENDER_INTERNAL_HOSTNAME)
        // reference for render.com
        return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
    // assume localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
}


export const react = createTRPCNext<ApiRouter>({
    ssr: true,
    config({ ctx }) {
        return {
            transformer: SuperJSON,
            links: [
                httpLink({
                    url: `${getBaseUrl()}/api/trpc`
                }),
                // httpBatchLink({
                //     url: `${getBaseUrl()}/api/trpc`
                // })
            ]
        }
    },
})

const vanilla = createTRPCProxyClient<ApiRouter>({
    transformer: SuperJSON,
    links: [
        httpLink({
            url: `${getBaseUrl()}/api/trpc`
        }),
    ]
})


export const useApiContext = create<{ current: ReturnType<typeof api['useContext']> }>(set => ({} as any));
export const apiContext = () => useApiContext.getState().current;


export const trpc = react;
export const api = createRecursiveProxy(({ path, args }) => {
    const last = path.slice(-1)[0];
    if (last.startsWith('use') || path[0].startsWith('use') || path[0] === 'withTRPC') {
        return get(react, path)(...args);
    } else if (last === 'query' || last === 'mutate' || last === 'subscribe') {
        return get(vanilla, path)(...args);
    } else {
        console.log('oof', { path, args });
        return get(apiContext(), path)(...args);
    }
}) as typeof react
    & typeof vanilla
    & ReturnType<typeof react['useContext']>;


export function ApiContextConsumer() {
    const context = api.useContext();
    useApiContext.setState({ current: context });
    return null;
}


