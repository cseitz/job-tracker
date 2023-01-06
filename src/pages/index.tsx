import { Box, Button, Input, TextInput } from '@mantine/core';
import { api } from '../utils/trpc';
import { useState } from 'react';


export default function Homepage() {
    const [value, setValue] = useState('');
    const query = api.ping.useQuery();
    const { mutate: createJob } = api.jobs.create.useMutation();
    return <Box>
        yeyeye, {query.data?.date?.toString()}
        <TextInput value={value} onInput={(evt) => setValue((evt.target as any).value)} />
        <Button onClick={() => {
            createJob({ title: value })
        }}>Create Job</Button>
    </Box>
}