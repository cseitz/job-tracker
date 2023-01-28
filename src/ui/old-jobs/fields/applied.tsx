import { DatePicker, DatePickerProps } from '@mantine/dates';
import { JobData } from '../../../backend/data/models/job';
import { useIsMobile } from '../../../hooks';
import { api } from '../../../utils/trpc';
import { Tooltip } from '@mantine/core';



function Applied(props: Partial<DatePickerProps> & { job: JobData }) {
    const { job, ...rest } = props;
    const { id, applied } = props.job;
    const isMobile = useIsMobile();
    const utils = api.useContext();
    const { mutate: updateJob } = api.jobs.update.useMutation({
        onSuccess(data, variables, context) {
            props.job.applied = data.job.applied;
            utils.jobs.list.invalidate();
        },
    })
    return <Tooltip label={applied.toLocaleDateString()}>
        <DatePicker value={applied} withinPortal variant='unstyled'
            clearable={false} dropdownType={isMobile ? 'modal' : 'popover'}
            onChange={(value) => {
                updateJob({ id, applied: value! })
            }} {...rest} />
    </Tooltip>
}

export default {
    Applied
}