import { ColorScheme, ColorSchemeProvider, DefaultMantineColor, MantineProvider, MantineThemeOverride, Tuple, useMantineTheme } from '@mantine/core';
import { getCookie, setCookie } from 'cookies-next';
import { merge } from 'lodash';
import { AppContext } from 'next/app';
import { useEffect, useMemo, useState } from 'react';


type ExtendedCustomColors = DefaultMantineColor
    | 'background';

declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
    }
}

const COLOR_SCHEME_COOKIE = 'job-tracker.color-scheme';
const FORCED_COLOR_SCHEME: ColorScheme | null = null; //'light';

var dynamicColorScheme = false;
export function ThemeProvider(props: { theme: Omit<MantineThemeOverride, 'colorScheme'>, colorScheme: ColorScheme, firstVisit?: boolean, children: any }) {
    const [colorScheme, setColorScheme] = useState(props.colorScheme);
    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
        setCookie(COLOR_SCHEME_COOKIE, nextColorScheme, { maxAge: 60 * 60 * 24 * 30, });
        setColorScheme(nextColorScheme);
    };

    const preferredColorScheme: ColorScheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    const desiredColorScheme = useMemo<ColorScheme>(() => {
        const desired = getCookie(COLOR_SCHEME_COOKIE);
        if (FORCED_COLOR_SCHEME) return FORCED_COLOR_SCHEME;
        if (desired === 'dark') return 'dark';
        if (desired === 'light') return 'light';
        return preferredColorScheme;
    }, [preferredColorScheme]);
    if (typeof window !== 'undefined' && !dynamicColorScheme) {
        dynamicColorScheme = true;
        if (colorScheme !== desiredColorScheme) {
            toggleColorScheme(desiredColorScheme);
        }
    }

    const themes: Record<ColorScheme, MantineThemeOverride> = {
        light: {},
        dark: {}
    }

    const theme: MantineThemeOverride = merge({ ...props.theme }, { colorScheme, ...themes[colorScheme] });

    /** Assign color scheme on first visit render */
    const [isThemeSet, setIsThemeSet] = useState(!props.firstVisit);
    useEffect(() => {
        if (isThemeSet) return;
        if (!props.firstVisit) return;
        if (colorScheme == desiredColorScheme) return;
        setIsThemeSet(true);
        toggleColorScheme(desiredColorScheme);
    }, [colorScheme, desiredColorScheme])

    return <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
            {props.children}
        </MantineProvider>
    </ColorSchemeProvider>
}

ThemeProvider.getInitialProps = ({ ctx }: AppContext) => {
    const cookie = getCookie(COLOR_SCHEME_COOKIE, ctx);
    const colorScheme: ColorScheme = cookie === 'dark' ? 'dark' : 'light';
    return {
        firstVisit: cookie === undefined,
        colorScheme: FORCED_COLOR_SCHEME || colorScheme,
    }
}




function useMediaQuery(query: string): boolean {
    const getMatches = (query: string): boolean => {
        // Prevents SSR issues
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches
        }
        return false
    }

    const [matches, setMatches] = useState<boolean>(getMatches(query))

    function handleChange() {
        setMatches(getMatches(query))
    }

    useEffect(() => {
        const matchMedia = window.matchMedia(query)

        // Triggered at the first client-side load and if query changes
        handleChange()

        // Listen matchMedia
        if (matchMedia.addListener) {
            matchMedia.addListener(handleChange)
        } else {
            matchMedia.addEventListener('change', handleChange)
        }

        return () => {
            if (matchMedia.removeListener) {
                matchMedia.removeListener(handleChange)
            } else {
                matchMedia.removeEventListener('change', handleChange)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    return matches
}