import { useRouter } from 'next/router';
import React, { useEffect, useId, useState } from 'react'

type Child = React.ReactElement<any, any>;

export function useClientHydration() {
    const [hydrated, setHydrated] = useState(typeof window !== 'undefined' && ('isHydrated' in window));
    useEffect(() => {
        if (!hydrated && typeof window !== 'undefined') {
            setHydrated(true);
            setTimeout(() => {
                // @ts-ignore
                window.isHydrated = true;
            }, 100);
        }
    })
    return hydrated;
}

export function NoSSR({ children, loader = <></> }: { children: Child, loader?: Child }): Child {
    const show = useClientHydration();
    return show ? children : loader;
}

