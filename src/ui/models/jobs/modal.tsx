import { JobData, jobData } from 'backend/data/models/job';
import { ModelController } from '../model';
import { ActionIcon, Alert, Box, Button, Checkbox, Divider, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';
import { api, apiContext } from 'utils/trpc';
import { openConfirmModal } from '@mantine/modals';
import { faTrash } from '@cseitz/icons-regular/trash';
import { Icon } from '@cseitz/icons';
import { Group } from '@mantine/core';
import { Code } from '@mantine/core';
import { Badge } from '@mantine/core';
import { JOB_STATUS_COLORS } from './fields/status';
import { useForm, zodResolver } from '@mantine/form';
import { pick } from 'lodash';
import { JobField } from './fields';
import { Grid } from '@mantine/core';
import { z } from 'zod';
import { faDollarSign } from '@cseitz/icons-regular/dollar-sign';

const TrashIcon = Icon(faTrash);
const MoneyIcon = Icon(faDollarSign);


export const Job = Object.assign(new ModelController({
    name: 'job',
    schema: jobData,

    modal: {
        size: 600,
        styles: {
            title: {
                marginRight: 4,
            }
        }
    },

    title(props) {
        const query = api.jobs.get.useQuery(Number(props.id), {
            enabled: props.opened,
        });

        const job = query.data?.job;
        return job ? <Group position='apart'>
            <Group spacing={'xs'}>
                <Code>{props.id}</Code>
                <Text>{job.company}</Text>
                <Divider orientation='vertical' />
                <Text>{job.title}</Text>
            </Group>
            <Group spacing={'xs'}>
                <Badge color={JOB_STATUS_COLORS[job.status]}>
                    {job.status}
                </Badge>
                {!job.deleted && <ActionIcon onClick={() => Job.delete(job.id)}>
                    <TrashIcon />
                </ActionIcon>}
            </Group>
        </Group> : <></>
    },

}, (props) => {
    const { id, opened } = props;

    const _id = useRef(id || '');
    if (opened) _id.current = id!;

    const query = api.jobs.get.useQuery(Number(_id.current), {
        enabled: opened,
    });

    const job = query.data?.job;

    const form = useForm({
        validate: zodResolver(jobData.pick({
            company: true,
            title: true,
            offer: true,
            status: true,
        }).extend({
            hasOffer: z.boolean(),
        })),
    });

    const mutation = api.jobs.update.useMutation({
        onSuccess() {
            api.jobs.get.invalidate(job!.id);
            api.jobs.invalidate();
        }
    });

    const onSubmit = form.onSubmit(values => {
        console.log('submit', { values });
        const { hasOffer, ...rest } = values;
        if (!hasOffer) {
            rest.offer = undefined;
        }
        mutation.mutate({
            id: job!.id,
            ...rest,
        });
    })

    const reset = () => {
        if (job) {
            form.reset();
            form.setValues(job);
            form.setFieldValue('hasOffer', job?.offer ? true : false);
        }
    }

    useEffect(reset, [job]);
    const isDirty = useMemo(() => {
        const { ...rest } = form.values;
        const state = JSON.stringify(rest);
        const serialized = JSON.stringify({
            ...pick(job, Object.keys(rest)),
            hasOffer: job?.offer ? true : false,
        });
        return state !== serialized;
    }, [form.values]);

    return <Box>
        <form onSubmit={onSubmit}>
            <Stack spacing={'xs'}>
                {job?.deleted && <Alert color='red'>
                    <Group sx={{ justifyContent: 'space-between' }}>
                        <Text c='red.4' fw='bold'>This job was deleted on {job?.deleted?.toLocaleDateString()} at {job?.deleted?.toLocaleTimeString()}</Text>
                        <Button variant='light' color='red.0' onClick={() => {
                            mutation.mutate({
                                id: job?.id,
                                deleted: undefined,
                            })
                        }}>Restore</Button>
                    </Group>
                </Alert>}
                <Grid>
                    <Grid.Col span={8}>
                        <TextInput label='Company' {...form.getInputProps('company')} disabled={mutation.isLoading} />
                    </Grid.Col>
                    <Grid.Col span={'auto'}>
                        {/* <JobField.Status label='Status' variant='default' job={{ ...job!, offer: form.values.hasOffer }} sx={{ flexGrow: 1 }} {...form.getInputProps('status')} /> */}
                        {job && <JobField.Applied label='Applied' variant='default' job={job} {...form.getInputProps('applied')} />}
                    </Grid.Col>
                </Grid>
                <TextInput label='Title' {...form.getInputProps('title')} disabled={mutation.isLoading} />
                <Grid>
                    <Grid.Col span={4}>
                        {job && <TextInput placeholder='100,000' label='Offer' styles={{
                            icon: {
                                pointerEvents: 'inherit',
                                // justifyContent: 'left',
                            }
                        }} icon={
                            <Checkbox sx={{ display: 'flex' }} ml={(36 - 20) / 2} {...form.getInputProps('hasOffer', {
                                type: 'checkbox',
                            })} color='green' icon={({ className }) => <MoneyIcon className={className} style={{ transform: 'scale(0.8)' }} />} />
                        } iconWidth={40} disabled={mutation.isLoading} {...form.getInputProps('offer')} required={form.values.hasOffer} onChange={(event) => {
                            const value = event.target.value;
                            if (value) {
                                form.setFieldValue('hasOffer', true);
                            } else {
                                form.setFieldValue('hasOffer', false);
                            }
                            console.log(form.values)
                            form.getInputProps('offer').onChange(event);
                        }} />}
                    </Grid.Col>
                    <Grid.Col span={'auto'}>
                        {job && <JobField.Status label='Status' variant='default' job={{ ...job, offer: form.values.hasOffer }} sx={{ flexGrow: 1 }} {...form.getInputProps('status')} />}
                    </Grid.Col>
                </Grid>
                <Grid mt="xl">
                    <Grid.Col span={7}>
                        <Group sx={{ justifyContent: 'left' }}>
                            <Button type="submit" disabled={mutation.isLoading}>Save Changes</Button>
                            {isDirty && <Button variant='subtle' disabled={mutation.isLoading} onClick={reset}>Discard Changes</Button>}
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={'auto'}>
                        <Group sx={{ justifyContent: 'right' }}>
                            {/* <Button variant='outline' disabled={mutation.isLoading} onClick={reset}>Discard Changes</Button> */}
                            <Button variant='outline' disabled={mutation.isLoading} onClick={() => Job.close()}>Cancel</Button>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Stack>
        </form>
    </Box>
}), {

    delete: promptDeleteJob,

})


function promptDeleteJob(id: JobData['id']) {
    openConfirmModal({
        title: `Are you sure you want to delete this job?`,
        labels: { confirm: 'Delete Job', cancel: 'Cancel' },
        confirmProps: {
            color: 'red',
            leftIcon: <TrashIcon />
        },
        onConfirm() {
            console.log('do delete job', { job: id });
            api.jobs.delete.mutate({ id }).then(() => {
                api.jobs.invalidate();
            })
        },
    })
}