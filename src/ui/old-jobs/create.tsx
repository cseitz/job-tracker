import { Button, Group, Modal, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { create } from 'zustand';
import { jobData } from '../../backend/data/models/job';
import { api } from '../../utils/trpc';


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
        })),
        initialValues: {
            company: '',
            title: '',
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
        console.log('submit', { values });
        mutation.mutate({
            title: values.title,
            company: values.company,
        });
    })

    return <Modal opened={opened} onClose={() => toggle(false)} title={<Title order={3}>Add Job</Title>}>
        <form onSubmit={onSubmit}>
            <TextInput label='Job Title' placeholder='Developer' {...form.getInputProps('title')} disabled={mutation.isLoading} withAsterisk />
            <TextInput label='Company' placeholder='Acme' {...form.getInputProps('company')} disabled={mutation.isLoading} withAsterisk mt='sm' />
            <Group position="right" mt="xl">
                <Button type="submit" disabled={mutation.isLoading}>Add</Button>
            </Group>
        </form>
    </Modal>
}