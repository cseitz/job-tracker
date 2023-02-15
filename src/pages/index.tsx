import { Icon } from '@cseitz/icons';
import { faLock } from '@cseitz/icons-regular/lock';
import { faPlus } from '@cseitz/icons-regular/plus';
import { Affix, Box, Button, Group, Paper, PasswordInput, SegmentedControl, TextInput } from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import { JobData } from '../backend/data/models/job';
import { createRouteParameter } from '../hooks';
import { CreateJobModal, createJob } from '../ui/models/jobs/create';
import { INTERVIEW_STATUSES, OFFER_STATUSES } from '../ui/models/jobs/fields/status';
import { Job } from '../ui/models/jobs/modal';
import { JobTable } from '../ui/models/jobs/table';
import { useClientHydration } from '../utils/ssr';
import { api } from '../utils/trpc';
import { openModal } from '@mantine/modals';
import { faEye } from '@cseitz/icons-regular/eye';
import { faEyeSlash } from '@cseitz/icons-regular/eye-slash';

const PlusIcon = Icon(faPlus);
const LoginIcon = Icon(faLock);
const ShowPasswordIcon = Icon(faEye);
const HidePasswordIcon = Icon(faEyeSlash);

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

    const isLoggedIn = useMemo(() => {
        if (typeof window === 'undefined') return true;
        return document.cookie.includes('jobAuth');
    }, [])

    const login = () => {
        openModal({
            title: `Login`,
            children: <LoginForm />,
        })
    }

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
            <Button leftIcon={
                isLoggedIn ? <PlusIcon /> : <LoginIcon />
            } size='md' radius='lg' onClick={() => (
                isLoggedIn ? createJob() : login()
            )}>
                {isLoggedIn ? 'Add Job' : 'Login'}
            </Button>
        </Affix>
    </Box>
}

function FilterBar() {

    const qStatus = useFilterStatusParam(o => o.value);
    const status: any = qStatus !== undefined ? qStatus : null;

    const qDeleted = useFilterDeletedParam(o => o.value);
    const deleted: any = qDeleted !== undefined ? 'true' : null;

    return <Group sx={{ justifyContent: 'space-between' }}>
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


function LoginForm() {
    const [password, setPassword] = useState('');

    const ctx = api.useContext();
    const submit = () => {
        document.cookie = `jobAuth=${password}; expires=Sun, 1 Jan 2033 00:00:00 UTC; path=/`;
        ctx.invalidate()
        location.reload();
    }

    return <>
        <PasswordInput label="Password" placeholder='Enter Password' data-autoFocus
            value={password} onChange={(event) => setPassword(event.target.value)}
            visibilityToggleIcon={({ reveal, size }) => (
                reveal ? <HidePasswordIcon scale={size} /> : <ShowPasswordIcon scale={size} />
            )}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    submit();
                }
            }} />
        <Button fullWidth mt='md' onClick={() => submit()}>Login</Button>
    </>
}