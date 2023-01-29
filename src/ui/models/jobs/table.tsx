import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { JobData } from '../../../backend/data/models/job';
import { ActionIcon, Box, Menu, Table, TableProps } from '@mantine/core';
import { JobField } from './fields';
import { onlyIf } from '../../../utils/mantine';
import { useEffect } from 'react';
import { NoSSR } from '../../../utils/ssr';
import { Icon } from '@cseitz/icons';
import { faCaretDown } from '@cseitz/icons-regular/caret-down';
import { faCaretUp } from '@cseitz/icons-regular/caret-up';
import { faEllipsis } from '@cseitz/icons-regular/ellipsis';
import { faTrash } from '@cseitz/icons-regular/trash';
import { faPencil } from '@cseitz/icons-regular/pencil';
import { Job } from './modal';

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
    status: c.accessor('status', {
        size: 300,
        cell(props) {
            const job = props.row.original;
            return <JobField.Status {...{ job }} sx={{ width: props.column.columnDef.size || undefined }} />
        },
    }),
    applied: c.accessor('applied', {
        minSize: 100,
        cell(props) {
            const job = props.row.original;
            return <JobField.Applied {...{ job }} sx={{ width: props.column.columnDef.size || undefined }} />
        },
    }),
}


const allColumns = Object.keys(jobTableColumns);
export function JobTable(props: Partial<TableProps> & {
    jobs: JobData[],
    columns?: JobTableColumns[],
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

    // useEffect(() => {
    // }, [table.getState().columnFilters[0]?.id])


    return <Table {...rest}>
        <thead>
            {table.getHeaderGroups().map(headerGroup => (
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
                    <th />
                </tr>
            ))}
        </thead>
        <tbody>
            {table.getRowModel().rows.map(row => (
                <tr key={row.id} onDoubleClick={() => openJob(row.original)}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                    <td>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <JobOptionsMenu job={row.original} />
                        </Box>
                    </td>
                </tr>
            ))}
        </tbody>
        <tfoot>
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
                    <th />
                </tr>
            ))}
        </tfoot>
    </Table>
}

export default JobTable;


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