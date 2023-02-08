import { Affix, Box, Button, Group, Paper, SegmentedControl, Transition } from '@mantine/core';
import { JobTable } from '../ui/models/jobs/table';
import { api } from '../utils/trpc';
import dynamic from 'next/dynamic';
import { NoSSR, useClientHydration } from '../utils/ssr';
import { Job } from '../ui/models/jobs/modal';
import { Icon } from '@cseitz/icons';
import { faPlus } from '@cseitz/icons-regular/plus';
import { CreateJobModal, createJob } from '../ui/models/jobs/create';
import { useRouter } from 'next/router';
import { createRouteParameter } from '../hooks';
import { JobData } from '../backend/data/models/job';
import { INTERVIEW_STATUSES, OFFER_STATUSES } from '../ui/models/jobs/fields/status';

const PlusIcon = Icon(faPlus);

const useFilterStatusParam = createRouteParameter({ name: 'status', type: String as () => JobData['status'] });
const useFilterDeletedParam = createRouteParameter({ name: 'deleted', type: Boolean });


export default function Homepage() {
    const qStatus = useFilterStatusParam(o => o.value);
    const qDeleted = useFilterDeletedParam(o => o.value);

    const query = api.jobs.list.useQuery({
        status: qStatus,
        deleted: qDeleted,
    });

    const jobs = query.data?.jobs || [];
    const isClient = useClientHydration();

    const superTall = false;
    return <Box p='sm'>
        <Job.Modal />
        <CreateJobModal />
        <FilterBar />
        <Paper withBorder mb={100}>
            <JobTable highlightOnHover {...{
                jobs: superTall ? [...jobs, ...jobs, ...jobs, ...jobs] : jobs,
            }} affix={{
                top: -30,
                pt: 30 + 8,
                sx: {
                    borderTop: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            }} sx={{
                opacity: isClient ? '1' : '0',
                transition: 'opacity 0.01s',
            }} />
        </Paper>
        {superTall && <Box sx={{ height: 5000 }}></Box>}
        <Affix position={{ bottom: '1.5em', right: '1.5em' }}>
            <Button leftIcon={<PlusIcon />} size='md' radius='lg' onClick={() => createJob()}>Add Job</Button>
        </Affix>
    </Box>
}

function FilterBar() {

    const qStatus = useFilterStatusParam(o => o.value);
    const status: any = qStatus !== undefined ? qStatus : null;

    const qDeleted = useFilterDeletedParam(o => o.value);
    const deleted: any = qDeleted !== undefined ? 'true' : null;

    return <Group sx={{ justifyContent: 'space-between'}}>
        <Group>
            <SegmentedControl defaultValue={status} value={status} data={[
                ...INTERVIEW_STATUSES,
                ...OFFER_STATUSES,
            ]} onChange={(value) => {
                useFilterStatusParam.setState({ value: value ? value as any : null })
            }} onClick={(event) => {
                const value = (event.target as any)?.value;
                if (value === status) {
                    useFilterStatusParam.setState({ value: null as any })
                }
            }} />
        </Group>
        <Group>
            <SegmentedControl defaultValue={deleted} value={deleted} data={[
                { label: 'Deleted', value: 'true' }
            ]} onChange={(value) => {
                useFilterDeletedParam.setState({ value: value ? true : null } as any)
            }} onClick={(event) => {
                const value = (event.target as any)?.value;
                if (qDeleted) {
                    useFilterDeletedParam.setState({ value: null } as any)
                }
            }} />
        </Group>
    </Group>
}