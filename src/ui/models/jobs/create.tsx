import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { jobData } from 'backend/data/models/job';
import { api } from 'utils/trpc';
import { create } from 'zustand';
import { CompanyIcon, LinkIcon, UserIcon } from './icons';


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
        })),
        initialValues: {
            company: '',
            title: '',
            link: '',
        }
    })

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
        });
    })

    return <Modal opened={opened} onClose={() => toggle(false)} title={<Title order={3}>Add Job</Title>} trapFocus>
        <form onSubmit={onSubmit}>
            <TextInput label='Company' placeholder='Acme' icon={<CompanyIcon />} data-autofocus {...form.getInputProps('company')} disabled={mutation.isLoading} required withAsterisk={false} mt='sm' />
            <TextInput label='Job Title' placeholder='Developer' icon={<UserIcon />} {...form.getInputProps('title')} disabled={mutation.isLoading} required withAsterisk={false} />
            <TextInput label='Link' placeholder='Link to Job Posting' icon={<LinkIcon />} {...form.getInputProps('link')} disabled={mutation.isLoading} required withAsterisk={false} />
            <Group position="right" mt="xl">
                <Button type="submit" disabled={mutation.isLoading}>Add</Button>
            </Group>
        </form>
    </Modal>
}