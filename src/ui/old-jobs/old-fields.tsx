import { Text } from '@mantine/core';
import dynamic from 'next/dynamic';

// @ts-ignore
const Applied = dynamic(() => import('./fields/applied').then(o => o.default), {
    ssr: false,
    // loader(props) {
    //     console.log('status.props', props);
    //     return <Text>yee</Text>
    // },
})

// @ts-ignore
const Status = dynamic(() => import('./fields/status').then(o => o.default), {
    ssr: false,
    // loader(props) {
    //     console.log('status.props', props);
    //     return <Text>yee</Text>
    // },
})

// @ts-ignore
const EditableText = dynamic(() => import('./fields/text').then(o => o.default), {
    ssr: false,
})

export const JobField = {
    Status,
    Applied,
    EditableText,
}

