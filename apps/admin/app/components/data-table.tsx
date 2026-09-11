import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Button,
	Checkbox,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type SortingState,
	type ColumnFiltersState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { useTableDensity } from '@/context/table-density'
import { DENSITY_CELL_CLASSES } from '@/shared/helpers/table-density'
import { ListPager } from './list-pager'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	searchKey?: string
	searchPlaceholder?: string
	pageSize?: number
	/**
	 * Server pagination: the rows arrive as one page and the pager writes the
	 * URL. Without it the table pages what it was given, in the browser.
	 */
	pagination?: { page: number; pageSize: number; total: number }
	/**
	 * Row selection, for the pages that act on several rows at once. Controlled
	 * by the page, because what the selection is *for* lives there — and because
	 * a batch that has just run must be able to clear it.
	 */
	selection?: {
		selected: string[]
		onChange: (ids: string[]) => void
		idOf: (row: TData) => string
		/** What one row is called, for the checkbox nobody sees but a reader. */
		label: (row: TData) => string
	}
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = 'Rechercher...',
	pageSize = 10,
	pagination,
	selection,
}: DataTableProps<TData, TValue>) {
	const { density } = useTableDensity()
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')

	// The selection column is the table's, not the caller's: every page that
	// selects wants the same header box and the same per-row box.
	const allColumns = selection
		? [selectionColumn<TData, TValue>(selection, data), ...columns]
		: columns

	const table = useReactTable({
		data,
		columns: allColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
		initialState: {
			pagination: { pageSize },
		},
	})

	return (
		<div className="space-y-4">
			{searchKey && (
				<div className="relative max-w-xs">
					<Search className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder={searchPlaceholder}
						value={globalFilter}
						onChange={e => setGlobalFilter(e.target.value)}
						className="h-9 rounded-lg pl-9"
					/>
				</div>
			)}

			<div className="bg-card overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow
								key={headerGroup.id}
								className="bg-muted/40 hover:bg-muted/40"
							>
								{headerGroup.headers.map(header => (
									<TableHead
										key={header.id}
										className="text-muted-foreground h-10 px-4 text-xs font-medium tracking-wide uppercase"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map(cell => (
										<TableCell
											key={cell.id}
											className={cn('px-4', DENSITY_CELL_CLASSES[density])}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={allColumns.length}
									className="text-muted-foreground h-24 text-center"
								>
									Aucun résultat trouvé.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{pagination ? (
				<ListPager {...pagination} />
			) : (
				<ClientPager table={table} />
			)}
		</div>
	)
}

function ClientPager<TData>({
	table,
}: {
	table: ReturnType<typeof useReactTable<TData>>
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="text-muted-foreground flex items-center gap-2 text-sm">
				<span>Lignes par page</span>
				<Select
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={value => table.setPageSize(Number(value))}
				>
					<SelectTrigger className="h-8 w-16">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{[10, 25, 50, 100].map(size => (
							<SelectItem key={size} value={`${size}`}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">
					Page {table.getState().pagination.pageIndex + 1} sur{' '}
					{table.getPageCount()}
				</span>
				<div className="flex gap-1">
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}

interface Selection<TData> {
	selected: string[]
	onChange: (ids: string[]) => void
	idOf: (row: TData) => string
	label: (row: TData) => string
}

/**
 * The header box ticks the page, not the base: what is off screen is not what
 * the operator looked at, and a batch acts on what was looked at. It shows
 * indeterminate rather than checked when only some rows are ticked, so the box
 * never claims more than it holds.
 */
function selectionColumn<TData, TValue>(
	selection: Selection<TData>,
	rows: TData[],
): ColumnDef<TData, TValue> {
	const onPage = rows.map(selection.idOf)
	const pickedOnPage = onPage.filter(id => selection.selected.includes(id))
	const all = onPage.length > 0 && pickedOnPage.length === onPage.length

	return {
		id: 'select',
		size: 32,
		header: () => (
			<Checkbox
				aria-label="Tout sélectionner sur cette page"
				checked={all ? true : pickedOnPage.length > 0 ? 'indeterminate' : false}
				onCheckedChange={checked =>
					selection.onChange(
						checked === true
							? [...new Set([...selection.selected, ...onPage])]
							: selection.selected.filter(id => !onPage.includes(id)),
					)
				}
			/>
		),
		cell: ({ row }) => {
			const id = selection.idOf(row.original)
			const picked = selection.selected.includes(id)

			return (
				<Checkbox
					aria-label={selection.label(row.original)}
					checked={picked}
					onCheckedChange={checked =>
						selection.onChange(
							checked === true
								? [...selection.selected, id]
								: selection.selected.filter(other => other !== id),
						)
					}
				/>
			)
		},
	}
}
