import { Group, MantineColor, Select, SelectItem, SelectProps, Text, useMantineTheme } from '@mantine/core'
import { JobData } from '../../../backend/data/models/job'
import { api } from '../../../utils/trpc';
import { Icon } from '@cseitz/icons';
import { forwardRef, useMemo } from 'react';
import { useColors, useProps } from '../../../hooks';
import { faClock } from '@cseitz/icons-regular/clock';
import { faBan } from '@cseitz/icons-regular/ban';
import { faCalendar } from '@cseitz/icons-regular/calendar';
import { faDollarSign } from '@cseitz/icons-regular/dollar-sign';
import { faHandshake } from '@cseitz/icons-regular/handshake';
import { faTrash } from '@cseitz/icons-regular/trash';

const PendingIcon = Icon(faClock);
const RejectedIcon = Icon(faBan);
const InterviewIcon = Icon(faCalendar);
const OfferedIcon = Icon(faDollarSign);
const AcceptedIcon = Icon(faHandshake);
const DeclinedIcon = Icon(faTrash);


type StatusSelectItem = SelectItem & { value: JobData['status'], color: MantineColor, icon?: any };
const INTERVIEW_STATUSES = ([
    { value: 'pending', label: 'Pending', color: 'grey', icon: PendingIcon, },
    { value: 'rejected', label: 'Rejected', color: 'red.6', icon: RejectedIcon },
    { value: 'interview', label: 'Interview', color: 'teal.6', icon: InterviewIcon },
] as const) satisfies readonly StatusSelectItem[];

const OFFER_STATUSES = ([
    { value: 'offered', label: 'Offered', color: 'green.5', icon: OfferedIcon },
    { value: 'accepted', label: 'Accepted', color: 'lime.6', icon: AcceptedIcon },
    { value: 'declined', label: 'Declined', color: 'red', icon: DeclinedIcon },
] as const) satisfies readonly StatusSelectItem[];

const StatusItem = forwardRef<HTMLDivElement, StatusSelectItem>(
    ({ color: _color, icon, label, ...rest }: StatusSelectItem, ref) => {
        const [color] = useColors([_color]);
        const Icon = icon;
        return <div ref={ref} {...rest}>
            <Group>
                <Icon color={color} sx={{ width: 26 }} />
                <Text>{label}</Text>
            </Group>
        </div>
    }
);

function Status(props: Partial<SelectProps> & { job: JobData }) {
    const { job, ...rest } = props;
    const { id, status, offer } = props.job;
    const data = (offer ? OFFER_STATUSES : INTERVIEW_STATUSES) as any;
    const entry = useMemo(() => data.find(o => o.value === status), [status]);
    const utils = api.useContext();
    const { mutate: updateJob } = api.jobs.update.useMutation({
        onSuccess(data, variables, context) {
            props.job.status = data.job.status;
            utils.jobs.list.invalidate();
        },
    })
    const [color] = useColors([entry.color]);
    const Icon = entry.icon;
    return <Select
        data={data}
        value={status}
        variant='unstyled'
        icon={Icon && <Icon color={color} />}
        itemComponent={StatusItem}
        rightSection={<span />}
        rightSectionWidth={0}
        onChange={(value: any) => {
            updateJob({ id: id, status: value })
        }}
        styles={(theme) => ({
            input: {
                color,
            }
        })}
        {...rest} />
}



export default {
    Status
}