import { Text, TextProps, Tooltip } from '@mantine/core';
import { JobData } from 'backend/data/models/job';
import { NoSSR } from 'utils/ssr';


const DAY = 24 * 60 * 60 * 1000;

function Updated(props: Partial<TextProps> & { job: JobData }) {
    const { job, ...rest } = props;
    const daysAgo = Math.floor((new Date().getTime() - job.updated.getTime()) / DAY);

    return <NoSSR>
        <Tooltip label={`Updated on ${job.updated.toLocaleDateString()} at ${job.updated.toLocaleTimeString()}`}>
            <Text c='dimmed'>{daysAgo <= 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}</Text>
        </Tooltip>
    </NoSSR>
}

export default { Updated }