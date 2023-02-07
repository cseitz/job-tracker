import { DatePicker, DatePickerProps } from '@mantine/dates';
import { JobData } from '../../../../backend/data/models/job';
import { useDatasetParam, useIsMobile } from '../../../../hooks';
import { api } from '../../../../utils/trpc';
import { Box, Tooltip } from '@mantine/core';
import { NoSSR } from '../../../../utils/ssr';



function Applied(props: Partial<DatePickerProps> & { job: JobData, mutate?: boolean }) {
    const { job, mutate, ...rest } = props;
    const { id, applied } = props.job;
    const isMobile = useIsMobile();
    const utils = api.useContext();
    const { mutate: updateJob } = api.jobs.update.useMutation({
        onSuccess(data, variables, context) {
            props.job.applied = data.job.applied;
            utils.jobs.list.invalidate();
        },
    })

    const picker = <DatePicker value={applied} withinPortal variant='unstyled'
        clearable={false} dropdownType={isMobile ? 'modal' : 'popover'}
        onChange={(value) => {
            if (mutate) updateJob({
                id,
                dataset: useDatasetParam.getState().value || '',
                applied: value!
            });
        }} {...rest} />;

    return <NoSSR loader={<Box style={{ height: 36 }} {...rest as any} />}>
        <Tooltip label={applied.toLocaleDateString()} position='top-start'>
            {picker}
        </Tooltip>
    </NoSSR>
}

export default {
    Applied
}