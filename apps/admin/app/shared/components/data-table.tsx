import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	searchKey?: string
	searchPlaceholder?: string
	pageSize?: number
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = 'Rechercher...',
	pageSize = 10,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
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
										<TableCell key={cell.id} className="px-4 py-3">
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
									colSpan={columns.length}
									className="text-muted-foreground h-24 text-center"
								>
									Aucun résultat trouvé.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

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
		</div>
	)
}
