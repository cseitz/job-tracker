import { JobData, jobData } from 'backend/data/models/job';
import { ModelController } from '../model';
import { Box } from '@mantine/core';
import { useRef } from 'react';
import { api, apiContext } from 'utils/trpc';
import { openConfirmModal } from '@mantine/modals';
import { faTrash } from '@cseitz/icons-regular/trash';
import { Icon } from '@cseitz/icons';

const TrashIcon = Icon(faTrash);


export const Job = Object.assign(new ModelController({
    name: 'job',
    schema: jobData,
}, (props) => {
    const { id, opened } = props;

    const _id = useRef(id || '');
    if (opened) _id.current = id!;

    const query = api.jobs.get.useQuery(Number(_id.current), {
        enabled: opened,
    });

    const job = query.data?.job;

    return <Box>
        yeee, {JSON.stringify(job)}
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