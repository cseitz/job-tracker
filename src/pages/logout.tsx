import { Box } from '@mantine/core';
import { useRouter } from 'next/router';
import { useLayoutEffect } from 'react';


export default function LogoutPage() {
    const router = useRouter();
    useLayoutEffect(() => {
        if (typeof window !== 'undefined') {
            document.cookie = `jobAuth=; expires=Sun, 1 Jan 1970 00:00:00 UTC; path=/`;
            router.replace('/');
        }
    }, [])
    return <Box>

    </Box>
}