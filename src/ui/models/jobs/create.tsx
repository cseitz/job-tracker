import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { jobData } from 'backend/data/models/job';
import { api } from 'utils/trpc';
import { create } from 'zustand';
import { CompanyIcon, LinkIcon, TagIcon, UserIcon } from './icons';
import { JobField } from './fields';
import { useEffect } from 'react';
import { useDatasetParam } from 'hooks';


type UseJobModal = {
    isOpen: boolean;
    toggle(open?: boolean): void;
}

export const useJobModal = create<UseJobModal>(set => ({
    isOpen: false,
    toggle(open) {
        if (open === undefined) {
            set(prev => ({ isOpen: !prev.isOpen }))
        } else {
            set({ isOpen: open })
        }
    },
}))

export function createJob() {
    useJobModal.setState({ isOpen: true });
}

export function CreateJobModal() {
    const opened = useJobModal(o => o.isOpen);
    const toggle = useJobModal(o => o.toggle);

    const form = useForm({
        validate: zodResolver(jobData.pick({
            company: true,
            title: true,
            link: true,
            tags: true,
        })),
        initialValues: {
            company: '',
            title: '',
            link: '',
            tags: [],
        }
    })

    useEffect(() => {
        if (!opened) {
            form.reset();
        }
    }, [opened])

    const context = api.useContext();
    const mutation = api.jobs.create.useMutation({
        onSuccess(data, variables) {
            context.jobs.list.invalidate();
            toggle(false);
            form.reset();
        },
    })

    const onSubmit = form.onSubmit(values => {
        // console.log('submit', { values });
        mutation.mutate({
            title: values.title,
            company: values.company,
            link: values.link,
            tags: values.tags,
            dataset: useDatasetParam.getState().value || '',
        });
    })

    return <Modal opened={opened} onClose={() => toggle(false)} title={<Title order={3}>Add Job</Title>} trapFocus>
        <form onSubmit={onSubmit}>
            <TextInput label='Company' placeholder='Acme' icon={<CompanyIcon />} data-autofocus {...form.getInputProps('company')} disabled={mutation.isLoading} required withAsterisk={false} mt='sm' />
            <TextInput label='Job Title' placeholder='Developer' icon={<UserIcon />} {...form.getInputProps('title')} disabled={mutation.isLoading} required withAsterisk={false} />
            <TextInput label='Link' placeholder='Link' icon={<LinkIcon />} {...form.getInputProps('link')} disabled={mutation.isLoading} required withAsterisk={false} />
            <JobField.TagSelect label='Tags' placeholder='Tags' icon={<TagIcon />} sx={{ flexGrow: 1 }} {...form.getInputProps('tags')} />
            <Group position="right" mt="xl">
                <Button type="submit" disabled={mutation.isLoading}>Add</Button>
            </Group>
        </form>
    </Modal>
}