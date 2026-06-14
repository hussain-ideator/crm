'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { LeadDetail, LeadListResponse } from '../types'

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  unqualified: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

const col = createColumnHelper<LeadDetail>()

const SORT_FIELDS = ['first_name', 'last_name', 'email', 'company_name', 'status', 'created_at'] as const
type SortField = (typeof SORT_FIELDS)[number]

function isSortable(field: string): field is SortField {
  return SORT_FIELDS.includes(field as SortField)
}

const columns = [
  col.display({
    id: 'name',
    header: 'Name',
    cell: (info) => `${info.row.original.first_name} ${info.row.original.last_name}`.trim(),
  }),
  col.accessor('company_name', { header: 'Company' }),
  col.accessor('email', { header: 'Email' }),
  col.accessor('phone', { header: 'Phone' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const s = info.getValue()
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[s] ?? ''}`}>
          {s}
        </span>
      )
    },
  }),
  col.accessor('source', {
    header: 'Source',
    cell: (info) => info.getValue()?.name ?? <span className="text-zinc-400">—</span>,
  }),
  col.accessor('owner', {
    header: 'Owner',
    cell: (info) => info.getValue()?.full_name ?? <span className="text-zinc-400">—</span>,
  }),
  col.accessor('created_at', {
    header: 'Created',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
]

interface Props {
  data: LeadListResponse
  page: number
  pageSize: number
}

export function LeadTable({ data, page, pageSize }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === null) {
          params.delete(k)
        } else {
          params.set(k, v)
        }
      }
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  const currentOrdering = searchParams.get('ordering') ?? '-created_at'

  function handleSort(field: string) {
    if (!isSortable(field)) return
    const next = currentOrdering === field ? `-${field}` : field
    updateParam({ ordering: next, page: null })
  }

  function handleRowClick(id: number) {
    router.push(`/leads/${id}`)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    rowCount: data.count,
  })

  const totalPages = Math.ceil(data.count / pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const field = header.column.id
                  const sortable = isSortable(field)
                  const isActive = currentOrdering === field || currentOrdering === `-${field}`
                  const isDesc = currentOrdering === `-${field}`
                  return (
                    <th
                      key={header.id}
                      onClick={sortable ? () => handleSort(field) : undefined}
                      className={[
                        'px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400',
                        sortable ? 'cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100' : '',
                      ].join(' ')}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isActive && <span className="ml-1">{isDesc ? '↓' : '↑'}</span>}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-400">
                  No leads found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original.id)}
                  className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {data.count} {data.count === 1 ? 'lead' : 'leads'}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateParam({ page: String(page - 1) })}
            className="rounded px-3 py-1 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Previous
          </button>
          <span className="px-2 py-1">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => updateParam({ page: String(page + 1) })}
            className="rounded px-3 py-1 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
