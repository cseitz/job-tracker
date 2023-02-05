import { DatePicker, DatePickerProps } from '@mantine/dates';
import { JobData } from '../../../../backend/data/models/job';
import { useIsMobile } from '../../../../hooks';
import { api } from '../../../../utils/trpc';
import { Box, CloseButton, MultiSelect, Tooltip, useMantineTheme } from '@mantine/core';
import { NoSSR } from '../../../../utils/ssr';
import { MultiSelectProps } from '@mantine/core';
import { Tags, parseTags } from 'backend/data/tags';
import { forwardRef, useMemo } from 'react';
import { SelectItemProps } from '@mantine/core';
import { MultiSelectValueProps } from '@mantine/core';
import { get } from 'lodash';


type TagOption = ReturnType<typeof useTagOptions>[number];
function useTagOptions() {
    const options = useMemo(() => {
        return Object.entries(Tags)
            .map(([key, tag]) => {
                return {
                    ...tag,
                    value: key,
                }
            })
    }, [Tags])
    return options;
}

function TagSelect(props: Partial<MultiSelectProps> & { job?: JobData, mutate?: boolean }) {
    const { job, mutate, ...rest } = props;
    const { id, tags } = props.job || { id: null, tags: new Set() };
    const isMobile = useIsMobile();
    const utils = api.useContext();
    const { mutate: updateJob } = api.jobs.update.useMutation({
        onSuccess(data, variables, context) {
            if (!props.job) return;
            props.job.tags = data.job.tags;
            utils.jobs.list.invalidate();
        },
    })

    const options = useTagOptions();

    const select = <MultiSelect value={tags ? parseTags(tags) : []} withinPortal
        clearable={false}
        data={options}
        valueComponent={TagValue}
        itemComponent={TagItem}
        onChange={(value) => {
            if (props.job && id) {
                if (mutate) updateJob({ id, tags: parseTags(value) });
                else {
                    props.job.tags = parseTags(value);
                }
            }
        }} {...rest} />;

    return <NoSSR loader={<Box style={{ height: 36 }} {...rest as any} />}>
        <Tooltip label={'Tags'} position='top-start'>
            {select}
        </Tooltip>
    </NoSSR>
}





export default {
    TagSelect
}


const TagItem = forwardRef<HTMLDivElement, Omit<SelectItemProps, keyof TagOption> & TagOption>(({ label, value, icon, color, ...others }, ref) => {
    const { colors } = useMantineTheme();
    const Icon = icon;

    return (
        <div ref={ref} {...others}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box mr={10}>
                    <Icon color={(get(colors, color) || color) as any} />
                </Box>
                <div>{label}</div>
            </Box>
        </div>
    );
});

function TagValue({
    value,
    label,
    onRemove,
    classNames,
    ...others
}: MultiSelectValueProps & { value: string }) {
    const { colors } = useMantineTheme();
    const options = useTagOptions();
    const option = options.find(o => o.value === value)!;
    const { color, icon } = option;
    const Icon = icon;

    return (
        <div {...others}>
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    cursor: 'default',
                    alignItems: 'center',
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[4]}`,
                    paddingLeft: 10,
                    borderRadius: 4,
                })}
            >
                <Box mr={10}>
                    <Icon color={(get(colors, color) || color) as any} />
                </Box>
                <Box sx={{ lineHeight: 1, fontSize: 12 }}>{label}</Box>
                <CloseButton
                    onMouseDown={onRemove}
                    variant="transparent"
                    size={22}
                    iconSize={14}
                    tabIndex={-1}
                />
            </Box>
        </div>
    );
}