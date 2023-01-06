import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { api } from '../../utils/trpc';
import { Button, Group, Table } from '@mantine/core';
import { JobData } from '../../backend/data/models/job';
import { JobField } from './fields';
import { DatePicker, TimeInput } from '@mantine/dates';

const c = createColumnHelper<JobData>();

const columns = [
    c.accessor('id', {

    }),
    c.accessor('company', {
        cell(props) {
            const job = props.row.original;
            return <JobField.EditableText field='company' {...{ job }} />
        },
    }),
    c.accessor('title', {
        cell(props) {
            const job = props.row.original;
            return <JobField.EditableText field='title' {...{ job }} />
        },
    }),
    c.accessor('status', {
        size: 250,
        cell(props) {
            const job = props.row.original;
            return <JobField.Status {...{ job }} sx={{ width: props.column.columnDef.size || undefined }} />
        },
    }),
    c.accessor('applied', {
        size: 100,
        cell(props) {
            const job = props.row.original;
            return <JobField.Applied {...{ job }} sx={{ width: props.column.columnDef.size || undefined }} />
        },
    }),
    c.accessor('updated', {
        size: 200,
        cell(props) {
            const job = props.row.original;
            return <Group sx={{ width: props.column.columnDef.size || undefined }}>
                <DatePicker value={job.updated} variant='unstyled' readOnly sx={{ flexShrink: 1, width: 100 }} />
                <TimeInput format='12' pmLabel='PM' amLabel='AM' value={job.updated}  variant='unstyled' />
            </Group>
        },
    })
];

export function JobTable() {
    const query = api.jobs.list.useQuery();
    const table = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        data: query.data?.jobs || [],
        columns,
    })
    return <Table>
        <thead>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
        <tbody>
            {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
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
                </tr>
            ))}
        </tfoot>
    </Table>
}

function JobEntry() {

}

