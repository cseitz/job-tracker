import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { JobData } from '../../../backend/data/models/job';
import { ActionIcon, Box, Global, Group, Menu, Paper, Table, TableProps } from '@mantine/core';
import { JobField } from './fields';
import { onlyIf } from '../../../utils/mantine';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { NoSSR } from '../../../utils/ssr';
import { Icon } from '@cseitz/icons';
import { faCaretDown } from '@cseitz/icons-regular/caret-down';
import { faCaretUp } from '@cseitz/icons-regular/caret-up';
import { faEllipsis } from '@cseitz/icons-regular/ellipsis';
import { faTrash } from '@cseitz/icons-regular/trash';
import { faPencil } from '@cseitz/icons-regular/pencil';
import { Job } from './modal';
import { useElementSize, useIntersection, useWindowScroll } from '@mantine/hooks';
import { PaperProps } from '@mantine/core';

const SortDescendingIcon = Icon(faCaretDown);
const SortAscendingIcon = Icon(faCaretUp);
const OptionsIcon = Icon(faEllipsis);
const EditIcon = Icon(faPencil);
const TrashIcon = Icon(faTrash);


const c = createColumnHelper<JobData>();

export type JobTableColumns = keyof typeof jobTableColumns;
export const jobTableColumns = {
    id: c.accessor('id', {

    }),
    company: c.accessor('company', {
        minSize: 100,
    }),
    title: c.accessor('title', {
        minSize: 200,
    }),
    applied: c.accessor('applied', {
        minSize: 100,
        maxSize: 180,
        cell(props) {
            const job = props.row.original;
            return <JobField.Applied mutate {...{ job }} sx={{
                width: props.column.columnDef.size,
                minWidth: props.column.columnDef.minSize,
                maxWidth: props.column.columnDef.maxSize,
            }} />
        },
    }),
    status: c.accessor('status', {
        // size: 300,
        // minSize: 200,
        // size: 300,
        // minSize: 200,
        // maxSize: 300,
        cell(props) {
            const job = props.row.original;
            return <JobField.Status mutate {...{ job }} sx={{
                // width: props.column.columnDef.size,
                // minWidth: props.column.columnDef.minSize,
                // maxWidth: props.column.columnDef.maxSize,
            }} />
        },
    }),
    updated: c.accessor('updated', {
        size: 100,
        cell(props) {
            const job = props.row.original;
            return <Group sx={{ justifyContent: 'space-between' }}>
                <JobField.Updated {...{ job }} sx={{ width: props.column.columnDef.size || undefined }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <JobOptionsMenu job={props.cell.row.original} />
                </Box>
            </Group>
        },
    }),
}


const allColumns = Object.keys(jobTableColumns);
export function JobTable(props: Partial<TableProps> & {
    jobs: JobData[],
    columns?: JobTableColumns[],
    affix?: boolean | TableAffixOptions,
}) {
    const {
        jobs,
        columns = allColumns,
        ...rest
    } = props;

    const table = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columns: columns.map(o => jobTableColumns[o]),
        data: jobs,
    })


    const { ref: headerRef, width } = useElementSize();

    const headers = table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
                <th key={header.id} {...{
                    onClick: header.column.getToggleSortingHandler(),
                    style: onlyIf(header.column.getCanSort(), {
                        userSelect: 'none',
                        cursor: 'pointer',
                    }),
                }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    <Box pl={'xs'} display={'inline-block'} sx={{ position: 'absolute' }}>
                        {{
                            asc: <SortAscendingIcon />,
                            desc: <SortDescendingIcon />
                        }[header.column.getIsSorted() as string] ?? null}
                    </Box>
                </th>
            ))}
        </tr>
    ));

    return <>
        {props.affix && <AffixHeader width={width} headerRef={headerRef} columns={props.columns} {...(props.affix === true ? {} : props.affix || {})}>
            {headers}
        </AffixHeader>}
        <Table {...rest}>
            <thead ref={headerRef}>
                {headers}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} onDoubleClick={() => openJob(row.original)}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            {/* <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                    <tr key={footerGroup.id}>
                        {footerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </tfoot> */}
        </Table>
    </>
}

export default JobTable;


type TableAffixOptions = {
    /** Offset from the top of the screen */
    top?: number
} & PaperProps;

function AffixHeader(props: { width: number, columns: any, headerRef: any, children: any } & TableAffixOptions) {
    const { width, columns, children, headerRef, top, ...rest } = props;

    const [scroll] = useWindowScroll();

    const affixHeaderRef = useRef<any>();
    if (typeof window !== 'undefined') {
        useLayoutEffect(() => {
            if (headerRef.current && affixHeaderRef.current) {
                const cells = headerRef.current.firstChild.children;
                const widths = [...cells].map(o => o.offsetWidth);
                [...affixHeaderRef.current.firstChild.children].forEach((o, i) => {
                    o.style.width = widths[i] + 'px'
                    o.style.border = 'none';
                });
            }
        }, [width, props.columns, scroll])
    }

    const isBefore = headerRef?.current?.getBoundingClientRect()?.top > (props.top ?? 4);
    const isAfter = headerRef?.current?.parentElement?.getBoundingClientRect()?.bottom < ((props.top ?? 4) + 2 * (headerRef?.current?.offsetHeight || 36));

    return <NoSSR>
        <Paper withBorder {...rest} sx={theme => ({
            ...((typeof rest.sx === 'function' ? rest.sx(theme) : rest.sx) || {}) as any,
            position: 'fixed', zIndex: 100, width: width,
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white',
            top: props.top ?? 4,
            borderLeft: 'none',
            borderRight: 'none',
        })} hidden={isBefore || isAfter}>
            <Table>
                <thead ref={affixHeaderRef}>
                    {children}
                </thead>
            </Table>
        </Paper>
    </NoSSR>;
}

function JobOptionsMenu(props: {
    job: JobData
}) {
    const { job } = props;

    return <NoSSR>
        <Menu shadow='md' width={200} position='left-start' trigger='hover'>
            <Menu.Target>
                <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'center' }}>
                    <ActionIcon>
                        <OptionsIcon />
                    </ActionIcon>
                </Box>

            </Menu.Target>
            <Menu.Dropdown>
                <>
                    <Menu.Label>Job - Options</Menu.Label>
                    <Menu.Item icon={<EditIcon scale={14} />} onClick={() => openJob(job)}>Edit</Menu.Item>
                </>

                <Menu.Divider />

                <>
                    <Menu.Item color='red' icon={<TrashIcon scale={14} />} onClick={() => Job.delete(job.id)}>Delete</Menu.Item>
                </>

            </Menu.Dropdown>
        </Menu>
    </NoSSR>
}

function openJob(job: JobData) {
    Job.open(job.id + '');
}