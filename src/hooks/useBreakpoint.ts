import { MantineSizes, useMantineTheme } from '@mantine/core'
import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';


/** Returns a value based on the values specified for specific breakpoints
 * - Values go from left to right and fill the most recent explicit value
 * - One usage of this is to adjust buttons on pagination depending on screen size, which can be done easily with this hook.
 * 
 * @example would return the value at the first applicable breakpoint in the list
 * { sm: 123, md: 456 } => { xs: 123, sm: 123, md: 456, lg: 456, xl: 456 }
 */
export function useBreakpointValues<T extends any>(values: Partial<Record<keyof MantineSizes, T>>) {
    const theme = useMantineTheme();
    const keys: (keyof MantineSizes)[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const isBreakpoint = keys.map(o => ([
        o, useMediaQuery(`(max-width: ${theme.breakpoints[o]}px)`)
    ]));
    const potential = useMemo(() => {
        const firstValue = values[keys.find(o => o in values) as any] as T;
        const potentialValues: T[] = [];
        let current = firstValue;
        for (const key of keys) {
            if (key in values) {
                current = values[key] as any;
            }
            potentialValues.push(current);
        }
        return potentialValues;
    }, [JSON.stringify(values)])
    const key = isBreakpoint.find(o => o[1])?.[0] || 'xl';
    return potential[keys.indexOf(key as any)];
}

/** Wrapper around `(max/min)-width: x` media query */
export function useBreakpoint(mode: '>=' | '>' | '<' | '<=', breakpoint: keyof MantineSizes) {
    const theme = useMantineTheme();
    let num = theme.breakpoints[breakpoint];
    let rule;
    switch (mode) {
        case '>=':
            rule = `max-width: ${num}`;
            break;
        case '>':
            rule = `max-width: ${num + 1}`;
            break;
        case '<=':
            rule = `min-width: ${num}`;
            break;
        case '<':
            rule = `min-width: ${num - 1}`;
            break;
    }
    return useMediaQuery(`(${rule}px)`)
}


// useBreakpoint('<=', 'md');