import { MantineThemeOverride } from '@mantine/core';
import { NextPageContext } from 'next';
import { AppContext, AppProps } from 'next/app';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta';
import { Router } from 'next/router';
import { createContext } from 'react';
import { ThemeProvider } from '../utils/mantine';
import { ApiContextConsumer, trpc } from '../utils/trpc';
import { RouteParameters } from 'hooks';
import { ModalsProvider } from '@mantine/modals';


export const InitialRouter = createContext<Router>(null as any);


function App(props: InitialProps) {
    const { Component, pageProps } = props;

    const { colorScheme, firstVisit } = props;
    const theme: MantineThemeOverride = {

    }

    return <ThemeProvider {...{ theme, colorScheme, firstVisit }}>
        <InitialRouter.Provider value={props.router}>
            <ModalsProvider>
                <ApiContextConsumer />
                <RouteParameters />
                <Component {...pageProps} />
            </ModalsProvider>
        </InitialRouter.Provider>
    </ThemeProvider>
}

type InitialProps = AppProps & Awaited<ReturnType<typeof App.getInitialProps>>;
App.getInitialProps = async function (ctx: AppContext) {
    return {
        ...ThemeProvider.getInitialProps(ctx),
    }
}

const _App = trpc.withTRPC(App);
const _getInitialProps: any = _App.getInitialProps || (() => ({}));
_App.getInitialProps = async (ctx: NextPageContext) => ({
    ...await App.getInitialProps(ctx as any as AppContext),
    ...await _getInitialProps(ctx),
});

export default _App;