import { MantineColor, useMantineTheme } from '@mantine/core';
import { createRouteParameter, RouteParameters } from './useRouteParameter';
import { useBreakpointValues, useBreakpoint } from './useBreakpoint';
import { useMediaQuery } from './useMediaQuery';
import { useProps } from './useProps';
import { get } from 'lodash';
import { useMemo } from 'react';

/** @export 'hooks' */

export type { UseProps } from './useProps';

export {
    useProps,
    useMediaQuery,
    useBreakpoint,
    useBreakpointValues,
    createRouteParameter,
    RouteParameters,
}


export const useDatasetParam = createRouteParameter({ name: 'dataset', type: String });

export function mappedActions<Actions extends Record<string, (...args: any[]) => any>>(actions: Actions) {
    return function <
        Key extends keyof Actions,
        Action extends ((...args: any[]) => any) = Actions[Key]
    >(action: Key, ...args: Parameters<Action>): ReturnType<Action> {
        return actions[action](...args);
    }
}


export function useIsMobile() {
    return useMediaQuery('(max-width: 600px');
}

export function useColors(colors: MantineColor[]) {
    const theme = useMantineTheme();
    return useMemo(() => {
        return colors.map(o => {
            const found = get(theme.colors, o) || o;
            if (typeof found === 'string') {
                return found;
            } else {
                return found[found.length - 1];
            }
        })
    }, colors)
}
