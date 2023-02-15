import { ActionIcon, Autocomplete, Box, Code, Divider, Group, Input, InputProps, NavLink, SelectItemProps, Text, TextInput, Tooltip } from '@mantine/core';
import { usePrevious } from '@mantine/hooks';
import { Index } from 'flexsearch';
import { forwardRef, useEffect, useState } from 'react';
import { JobData } from '../../../backend/data/models/job';
import { NoSSR } from '../../../utils/ssr';
import { ClearIcon, SearchIcon } from './icons';
import { Job } from './modal';


const flexIndex = new Index({
    charset: "latin:advanced",
    tokenize: "reverse",
    cache: true
})

const JobCache = new Map<number, JobData>();
export function setJobSearchData(jobs: JobData[]) {
    const previous = usePrevious(jobs)
    useEffect(() => {
        previous?.forEach(job => {
            flexIndex.remove(job.id);
        })
        jobs.forEach(job => {
            JobCache.set(job.id, job);
            flexIndex.add(job.id, job.company + ' ' + job.title + ' ' + job.tags?.join(' '));
        })
    }, jobs)
}


export function JobSearch(props: InputProps) {
    const [value, setValue] = useState('');
    const [filtered, setFiltered] = useState<(JobData & { value: string })[]>([]);
    useEffect(() => {
        const found = flexIndex.search(value);
        setFiltered(
            found.map(id => JobCache.get(Number(id)))
                .filter(o => o)
                .map(job => ({ ...job, value: 'job:' + String(job?.id) })) as any
        );
    }, [value]);

    return <NoSSR loader={<Input {...props} />}>
        <Autocomplete {...props}
            placeholder='Search listed jobs'
            icon={<SearchIcon />}
            value={value} onInput={(event) => setValue((event.target as any).value)}
            onItemSubmit={(item) => Job.open(item.id)}
            data={filtered} rightSection={<Group>
                {props?.rightSection}
                {props?.rightSection && <Divider orientation='vertical' />}
                {value.length > 0 && <Tooltip label='Clear'>
                    <ActionIcon color='gray' onClick={() => setValue('')}>
                        <ClearIcon color='inherit' />
                    </ActionIcon>
                </Tooltip>}
            </Group>}
            itemComponent={AutoCompleteItem}
            filter={() => true} limit={5}
        />
    </NoSSR>
}


type ItemProps = SelectItemProps & JobData;

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ value, company, title, id, ...rest }: ItemProps, ref) => (
        <div ref={ref} key={value} {...rest}>
            {/* <NavLink label={company} description={title} icon={<Code>{id}</Code>} /> */}
            <Group noWrap>
                <Code>{id}</Code>
                <div>
                    <Text>{company}</Text>
                    <Text size="xs" color="dimmed">
                        {title}
                    </Text>
                </div>
            </Group>
        </div>
    )
);