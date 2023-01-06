import { DatePicker } from '@mantine/dates';
import { JobData } from '../../../backend/data/models/job';
import { useIsMobile, useProps } from '../../../hooks';
import { api } from '../../../utils/trpc';
import { ActionIcon, Group, GroupProps, TextInput, Tooltip } from '@mantine/core';
import { Icon } from '@cseitz/icons';
import { faCheck } from '@cseitz/icons-regular/check';
import { faClose } from '@cseitz/icons-regular/close';
import { useState } from 'react';

const SaveChangesIcon = Icon(faCheck);
const CancelChangesIcon = Icon(faClose);


type StringJobFields = Exclude<{
    [P in keyof JobData]: JobData[P] extends string ? P : never;
}[keyof JobData], undefined>;

function EditableText(props: Partial<GroupProps> & { job: JobData, field: StringJobFields }) {
    const { job, field, ...rest } = props;
    const { id } = props.job;
    const value = props.job[props.field];
    const [input, setInput] = useState(value);
    const utils = api.useContext();
    const args = useProps(rest, {
        justifyContent: 'space-between',
        spacing: 0,
    })
    const { mutate: updateJob } = api.jobs.update.useMutation({
        onSuccess(data, variables, context) {
            props.job.applied = data.job.applied;
            utils.jobs.list.invalidate();
        },
    })
    
    return <Group {...args}>
        <TextInput value={input} onInput={(event) => {
            setInput((event.target as any).value);
        }} variant='unstyled' sx={{ flexGrow: 1, paddingRight: value === input ? 56 : 0 }} />
        {value !== input && <Group spacing={0} sx={{ width: 56 }}>
            <Tooltip label='Save Changes'>
                <ActionIcon onClick={() => updateJob({ id, [props.field]: input })}>
                    <SaveChangesIcon />
                </ActionIcon>
            </Tooltip>
            <Tooltip label='Cancel'>
                <ActionIcon onClick={() => setInput(value)}>
                    <CancelChangesIcon />
                </ActionIcon>
            </Tooltip>
        </Group>}
    </Group>
}

export default {
    EditableText
}