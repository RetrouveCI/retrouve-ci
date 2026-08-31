import { Check, Palette } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { useTheme } from '@/context/theme'
import { THEME_PREFERENCES, type ThemePreference } from '@/shared/helpers/theme'

const LABELS: Record<ThemePreference, string> = {
	light: 'Clair',
	dark: 'Sombre',
	system: 'Système',
}

/**
 * The miniatures are painted in **fixed** colours, not tokens: each one shows
 * what a theme looks like, so the light preview must stay light even when the
 * app is dark. Only the card around them follows the theme.
 */
const SURFACES = {
	light: { page: '#FFFFFF', edge: '#E6E4E1', ink: '#181B1F', line: '#E6E4E1' },
	dark: { page: '#080A0E', edge: '#2B2E33', ink: '#FAFAFA', line: '#2B2E33' },
} as const

function MiniPage({
	tone,
	half = false,
}: {
	tone: 'light' | 'dark'
	half?: boolean
}) {
	const { page, ink, line } = SURFACES[tone]

	return (
		<span
			className="flex flex-col gap-1 p-[7px]"
			style={{ background: page, width: half ? '50%' : '100%' }}
		>
			<span
				className="block h-[7px] rounded-[3px]"
				style={{ background: ink, width: half ? '85%' : '70%' }}
			/>
			<span
				className="block h-[5px] rounded-[3px]"
				style={{ background: line, width: half ? '95%' : '90%' }}
			/>
			{!half && (
				<>
					<span
						className="block h-[5px] w-[55%] rounded-[3px]"
						style={{ background: line }}
					/>
					<span
						className="mt-auto block h-[11px] w-[46%] rounded-[4px]"
						style={{ background: '#1E7F43' }}
					/>
				</>
			)}
		</span>
	)
}

function ThemePreview({ preference }: { preference: ThemePreference }) {
	if (preference === 'system') {
		return (
			<span
				className="flex h-[62px] w-full overflow-hidden rounded-[9px] border"
				style={{ borderColor: SURFACES.light.edge }}
			>
				<MiniPage tone="light" half />
				<MiniPage tone="dark" half />
			</span>
		)
	}

	return (
		<span
			className="flex h-[62px] w-full overflow-hidden rounded-[9px] border"
			style={{ borderColor: SURFACES[preference].edge }}
		>
			<MiniPage tone={preference} />
		</span>
	)
}

export function AppearanceSection() {
	const { preference, setTheme } = useTheme()

	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<Palette className="text-primary-green-text h-4 w-4" />
					Apparence
				</h2>
			</div>

			<div className="space-y-3 p-5">
				<fieldset className="grid grid-cols-3 gap-2.5">
					<legend className="sr-only">Thème de l&apos;interface</legend>

					{THEME_PREFERENCES.map(value => {
						const isSelected = preference === value

						return (
							<label key={value} className="cursor-pointer">
								{/**
								 * A real radio, hidden but focusable: it carries the arrow-key
								 * navigation, the group semantics and the screen-reader
								 * announcement that a styled button would each have to rebuild.
								 */}
								<input
									type="radio"
									name="theme-preference"
									value={value}
									checked={isSelected}
									onChange={() => setTheme(value)}
									className="peer sr-only"
								/>
								<span
									className={cn(
										'peer-focus-visible:ring-ring flex flex-col items-center gap-2.5 rounded-[14px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
										// The selected card gains a pixel of border and gives one
										// back in padding, so nothing shifts when it is chosen.
										isSelected
											? 'border-primary-green bg-primary-green/10 border-2 p-[9px]'
											: 'hover:border-foreground/20 border p-2.5',
									)}
								>
									<ThemePreview preference={value} />
									<span
										className={cn(
											'flex items-center gap-1.5 text-[12.5px]',
											isSelected
												? 'text-primary-green-text font-semibold'
												: 'text-muted-foreground font-medium',
										)}
									>
										{isSelected && <Check className="h-3.5 w-3.5" />}
										{LABELS[value]}
									</span>
								</span>
							</label>
						)
					})}
				</fieldset>

				<p className="text-muted-foreground text-xs">
					« Système » suit le réglage de votre téléphone.
				</p>
			</div>
		</div>
	)
}
