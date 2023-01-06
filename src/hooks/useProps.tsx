import { HTMLProps } from 'react';
import { Box, BoxProps, extractSystemStyles } from '@mantine/core';
import {
    MantineStyleSystemProps,
    MantineTheme,
    Sx,
    useCss,
    useMantineTheme,
} from '@mantine/styles';
import { getSystemStyles } from '@mantine/core';

function extractSx(sx: Sx, theme: MantineTheme) {
    return typeof sx === 'function' ? sx(theme) : sx;
}

function useSx(sx: Sx | Sx[], systemProps: MantineStyleSystemProps, className: string) {
    const theme = useMantineTheme();
    const { css, cx } = useCss();

    if (Array.isArray(sx)) {
        return cx(
            className,
            css(getSystemStyles(systemProps, theme)),
            sx.map((partial) => css(extractSx(partial, theme)))
        );
    }

    return cx(className, css(extractSx(sx, theme)), css(getSystemStyles(systemProps, theme)));
}

type IntegratedProps = Omit<BoxProps, 'className' | 'classNames'> & {

}



export type UseProps = Partial<IntegratedProps>;

export function useProps<
    T extends object = HTMLProps<HTMLElement>,
    P extends object = Partial<IntegratedProps> & Partial<Omit<T, keyof IntegratedProps>>,
>(
    input: T & Partial<Omit<IntegratedProps, keyof T>>,
    props?: P
): T & Partial<Omit<P, keyof T>> {
    const _input = input as any;
    const _props = props as any;

    let className = _input?.className;
    let style = _input?.style;
    let rest = _input;

    if (props) {
        // Compute mantine styles
        const { systemStyles, rest: _rest } = extractSystemStyles(Object.assign({
            ..._props,
            ..._input,
            className: undefined,
            style: undefined,
            sx: undefined,
        }));

        // Merge classes
        className = useSx([_input?.sx || {}, _props?.sx || {}].filter(o => o), systemStyles, [
            _props?.className,
            _input.className,
        ].filter(o => o)
            .map(o => typeof o != 'string' && Array.isArray(o)
                ? o.join(' ')
                : o
            ).join(' ')
        );

        // Merge styles
        style = Object.assign(_input?.style || {}, _props?.style || {});
    }

    // Ensure className property is a string
    if (className && typeof className != 'string' && Array.isArray(className)) {
        className = className.join(' ');
    }

    return {
        ...rest,
        className,
        style,
    }
}


function wat(props: UseProps) {
    const stuff = useProps(props, {
        classNames: {
            hello: true,
        }
    })
}
