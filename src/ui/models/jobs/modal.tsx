import { ActionIcon, Alert, Badge, Box, Button, Code, Divider, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { openConfirmModal } from '@mantine/modals';
import { JobData, jobData } from 'backend/data/models/job';
import { pick } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { onlyIf } from 'utils/mantine';
import { api } from 'utils/trpc';
import { z } from 'zod';
import { ModelController } from '../model';
import { JobField } from './fields';
import { JOB_STATUS_COLORS } from './fields/status';
import { CalendarIcon, CompanyIcon, LinkIcon, MoneyIcon, TagIcon, TrashIcon, UserIcon } from './icons';
import { useDebouncedState } from '@mantine/hooks';
import { useDatasetParam } from 'hooks';


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
        const query = api.jobs.get.useQuery({
            id: Number(props.id),
            dataset: useDatasetParam.getState().value || '',
        }, {
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

    const query = api.jobs.get.useQuery({
        id: Number(_id.current),
        dataset: useDatasetParam.getState().value || '',
    }, {
        enabled: opened,
    });

    const job = query.data?.job;

    const form = useForm({
        validate: zodResolver(jobData.pick({
            company: true,
            title: true,
            offer: true,
            status: true,
            link: true,
            tags: true,
        }).extend({
            hasOffer: z.boolean(),
            // tags: z.array(jobData.shape.tags._def.innerType)
        })),
    });

    const [isMutating, setIsMutating] = useState(false);
    const mutation = api.jobs.update.useMutation({
        onSuccess() {
            api.jobs.get.invalidate({
                id: job!.id,
                dataset: useDatasetParam.getState().value || '',
            });
            api.jobs.invalidate();
            setTimeout(() => {
                setIsMutating(false);
            }, 100)
        }
    });

    const onSubmit = form.onSubmit(values => {
        console.log('submit', { values });
        const { hasOffer, tags, ...rest } = values;
        if (!hasOffer) {
            rest.offer = undefined;
        }
        setIsMutating(true);
        mutation.mutate({
            id: job!.id,
            dataset: useDatasetParam.getState().value || '',
            tags: [...new Set<any>(tags) as any],
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
        return !isMutating && state !== serialized;
    }, [form.values, isMutating]);



    const editing = true; //false;

    return <Box>
        <form onSubmit={onSubmit}>
            <Stack spacing={'xs'}>
                {job?.deleted && <Alert color='red'>
                    <Group sx={{ justifyContent: 'space-between' }}>
                        <Text c='red.4' fw='bold'>This job was deleted on {job?.deleted?.toLocaleDateString()} at {job?.deleted?.toLocaleTimeString()}</Text>
                        <Button variant='light' color='red.0' onClick={() => {
                            mutation.mutate({
                                id: job?.id,
                                dataset: useDatasetParam.getState().value || '',
                                deleted: undefined,
                            })
                        }}>Restore</Button>
                    </Group>
                </Alert>}
                <Grid>
                    <Grid.Col span={8}>
                        <TextInput label='Company' icon={<CompanyIcon />} {...form.getInputProps('company')}
                            variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} disabled={mutation.isLoading} />
                    </Grid.Col>
                    <Grid.Col span={'auto'}>
                        {/* <JobField.Status label='Status' variant='default' job={{ ...job!, offer: form.values.hasOffer }} sx={{ flexGrow: 1 }} {...form.getInputProps('status')} /> */}
                        {job && <JobField.Applied icon={<CalendarIcon />} label='Applied' variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} job={job} {...form.getInputProps('applied')} />}
                    </Grid.Col>
                </Grid>
                <TextInput label='Title' icon={<UserIcon />} {...form.getInputProps('title')} variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} disabled={mutation.isLoading} />
                <Grid>
                    {job && (editing || job.offer) && <Grid.Col span={4}>
                        {/* {job && <TextInput placeholder='No Offer Received' label='Offer' variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} styles={{
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
                            form.getInputProps('offer').onChange(event);
                        }} />} */}
                        {job && <TextInput placeholder='No Offer Received' label='Offer' variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} styles={{
                            icon: {
                                pointerEvents: 'inherit',
                                // justifyContent: 'left',
                            }
                        }} icon={<MoneyIcon />} disabled={mutation.isLoading} {...form.getInputProps('offer')} required={form.values.hasOffer} onChange={(event) => {
                            const value = event.target.value;
                            if (value) {
                                form.setFieldValue('hasOffer', true);
                            } else {
                                form.setFieldValue('hasOffer', false);
                            }
                            form.getInputProps('offer').onChange(event);
                        }} />}
                    </Grid.Col>}
                    <Grid.Col span={'auto'}>
                        {job && <JobField.Status label='Status' job={{ ...job, offer: form.values.hasOffer }} sx={{ flexGrow: 1 }} variant={editing ? 'default' : 'unstyled'} readOnly={!editing} {...form.getInputProps('status')} />}
                    </Grid.Col>
                </Grid>
                <TextInput label='Link' placeholder='Link to Job Posting' icon={<LinkIcon />} {...form.getInputProps('link')} variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} disabled={mutation.isLoading} />
                {/* <JobField.TagSelect job={{ ...job }} label='Tags' icon={<LinkIcon />} {...form.getInputProps('tags')} onChange={(value) => {
                    form.getInputProps('tags').onChange(new Set(value));
                }} variant={onlyIf(!editing, 'unstyled')} readOnly={!editing} disabled={mutation.isLoading} /> */}
                {job && <JobField.TagSelect label='Tags' placeholder='Tags' job={{ ...job }} icon={<TagIcon />} sx={{ flexGrow: 1 }} variant={editing ? 'default' : 'unstyled'} readOnly={!editing} {...form.getInputProps('tags')} />}
                {<Grid mt="xl">
                    <Grid.Col span={'auto'}>
                        <Group sx={{ justifyContent: 'left' }}>
                            {isDirty && <Button variant='subtle' disabled={mutation.isLoading} onClick={reset}>Discard Changes</Button>}
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Group sx={{ justifyContent: 'right' }}>
                            {isDirty && <Button type="submit" disabled={mutation.isLoading}>Save Changes</Button>}
                        </Group>
                    </Grid.Col>
                </Grid>}
                {/* <Grid mt="xl">
                    <Grid.Col span={'auto'}>
                        <Group sx={{ justifyContent: 'left' }}>
                            {isDirty && <Button variant='outline' disabled={mutation.isLoading} onClick={() => Job.close()}>
                                {isDirty ? 'Cancel' : 'Close'}
                            </Button>}
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Group sx={{ justifyContent: 'right' }}>
                            {isDirty && <Button variant='subtle' disabled={mutation.isLoading} onClick={reset}>Discard Changes</Button>}
                            {isDirty && <Button type="submit" disabled={mutation.isLoading}>Save Changes</Button>}
                        </Group>
                    </Grid.Col>
                </Grid> */}
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
            api.jobs.delete.mutate({
                id,
                dataset: useDatasetParam.getState().value || '',
            }).then(() => {
                api.jobs.invalidate();
            })
        },
    })
}