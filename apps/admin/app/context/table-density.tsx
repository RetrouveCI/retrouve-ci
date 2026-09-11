import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'
import {
	DEFAULT_TABLE_DENSITY,
	TABLE_DENSITY_COOKIE,
	type TableDensity,
} from '@/shared/helpers/table-density'

interface TableDensityValue {
	density: TableDensity
	setDensity: (density: TableDensity) => void
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

// A default rather than a throw: a table rendered outside the shell — a test,
// a dialog — reads the normal density.
const TableDensityContext = createContext<TableDensityValue>({
	density: DEFAULT_TABLE_DENSITY,
	setDensity: () => {},
})

export function TableDensityProvider({
	initial,
	children,
}: {
	initial?: TableDensity
	children: React.ReactNode
}) {
	const [density, setState] = useState(initial ?? DEFAULT_TABLE_DENSITY)

	const setDensity = useCallback((next: TableDensity) => {
		setState(next)
		document.cookie = `${TABLE_DENSITY_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
	}, [])

	const value = useMemo(() => ({ density, setDensity }), [density, setDensity])

	return (
		<TableDensityContext.Provider value={value}>
			{children}
		</TableDensityContext.Provider>
	)
}

export function useTableDensity() {
	return useContext(TableDensityContext)
}
