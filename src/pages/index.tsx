import { Affix, Box, Button, Transition } from '@mantine/core';
import { JobTable } from '../ui/models/jobs/table';
import { api } from '../utils/trpc';
import dynamic from 'next/dynamic';
import { NoSSR, useClientHydration } from '../utils/ssr';
import { Job } from 'ui/models/jobs/modal';
import { Icon } from '@cseitz/icons';
import { faPlus } from '@cseitz/icons-regular/plus';
import { CreateJobModal, createJob } from 'ui/models/jobs/create';

const PlusIcon = Icon(faPlus);


export default function Homepage() {
    const query = api.jobs.list.useQuery();
    const jobs = query.data?.jobs || [];
    const isClient = useClientHydration();
    return <Box>
        <Job.Modal />
        <CreateJobModal />
        <JobTable highlightOnHover {...{
            jobs,
        }} sx={{
            opacity: isClient ? '1' : '0',
            transition: 'opacity 0.01s',
        }} />
        <Affix position={{ bottom: '1.5em', right: '1.5em' }}>
            <Button leftIcon={<PlusIcon />} size='md' radius='lg' onClick={() => createJob()}>Add Job</Button>
        </Affix>
    </Box>
}

