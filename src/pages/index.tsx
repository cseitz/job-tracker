import { Affix, Box, Button, Input, Table, TextInput } from '@mantine/core';
import { api } from '../utils/trpc';
import { useState } from 'react';
import { useReactTable } from '@tanstack/react-table';
import { JobTable } from '../ui/jobs/table';
import { Icon } from '@cseitz/icons';
import { faPlus } from '@cseitz/icons-regular/plus';

const PlusIcon = Icon(faPlus);

export default function Homepage() {
    const [value, setValue] = useState('');
    // const query = api.ping.useQuery();
    // const { mutate: createJob } = api.jobs.create.useMutation();
    return <Box>
        {/* yeyeye, {query.data?.date?.toString()} */}
        <TextInput value={value} onInput={(evt) => setValue((evt.target as any).value)} />
        <Button onClick={() => {
            // createJob({ title: value, company: 'idk' })
        }}>Create Job</Button>
        <Box sx={{ overflowX: 'auto' }}>
            <JobTable sx={{ minWidth: 800 }} />
        </Box>
        <Affix position={{ bottom: '1.5em', right: '1.5em' }}>
            <Button leftIcon={<PlusIcon />} size='md'>Add Job</Button>
        </Affix>
    </Box>
}


