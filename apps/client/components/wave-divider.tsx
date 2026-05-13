import { cn } from '@retrouve-ci/ui/utils'

type WaveVariant = 'smooth' | 'layered' | 'asymmetric' | 'inverse'
type WaveColor = 'green' | 'orange' | 'mixed'

interface WaveDividerProps {
	variant?: WaveVariant
	color?: WaveColor
	className?: string
	flip?: boolean
}

const colorClasses = {
	green: {
		primary: 'fill-primary-green/10',
		secondary: 'fill-primary-green/5',
		tertiary: 'fill-primary-green/3',
	},
	orange: {
		primary: 'fill-accent-orange/10',
		secondary: 'fill-accent-orange/5',
		tertiary: 'fill-accent-orange/3',
	},
	mixed: {
		primary: 'fill-primary-green/10',
		secondary: 'fill-accent-orange/8',
		tertiary: 'fill-primary-green/5',
	},
}

export function WaveDivider({
	variant = 'smooth',
	color = 'green',
	className,
	flip = false,
}: WaveDividerProps) {
	const colors = colorClasses[color]

	return (
		<div
			className={cn(
				'w-full overflow-hidden leading-[0]',
				flip && 'rotate-180',
				className,
			)}
			aria-hidden="true"
		>
			{variant === 'smooth' && (
				<svg
					viewBox="0 0 1440 120"
					className="h-[60px] w-full md:h-[80px] lg:h-[100px]"
					preserveAspectRatio="none"
				>
					<path
						d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
						className={colors.primary}
					/>
				</svg>
			)}

			{variant === 'layered' && (
				<svg
					viewBox="0 0 1440 150"
					className="h-[80px] w-full md:h-[100px] lg:h-[120px]"
					preserveAspectRatio="none"
				>
					<path
						d="M0,96L60,90.7C120,85,240,75,360,74.7C480,75,600,85,720,90.7C840,96,960,96,1080,85.3C1200,75,1320,53,1380,42.7L1440,32L1440,150L1380,150C1320,150,1200,150,1080,150C960,150,840,150,720,150C600,150,480,150,360,150C240,150,120,150,60,150L0,150Z"
						className={colors.tertiary}
					/>
					<path
						d="M0,64L60,69.3C120,75,240,85,360,85.3C480,85,600,75,720,69.3C840,64,960,64,1080,69.3C1200,75,1320,85,1380,90.7L1440,96L1440,150L1380,150C1320,150,1200,150,1080,150C960,150,840,150,720,150C600,150,480,150,360,150C240,150,120,150,60,150L0,150Z"
						className={colors.secondary}
					/>
					<path
						d="M0,96L60,101.3C120,107,240,117,360,117.3C480,117,600,107,720,96C840,85,960,75,1080,74.7C1200,75,1320,85,1380,90.7L1440,96L1440,150L1380,150C1320,150,1200,150,1080,150C960,150,840,150,720,150C600,150,480,150,360,150C240,150,120,150,60,150L0,150Z"
						className={colors.primary}
					/>
				</svg>
			)}

			{variant === 'asymmetric' && (
				<svg
					viewBox="0 0 1440 120"
					className="h-[60px] w-full md:h-[80px] lg:h-[100px]"
					preserveAspectRatio="none"
				>
					<path
						d="M0,32L120,37.3C240,43,480,53,720,58.7C960,64,1200,64,1320,64L1440,64L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
						className={colors.secondary}
					/>
					<path
						d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,64C1120,53,1280,43,1360,37.3L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
						className={colors.primary}
					/>
				</svg>
			)}

			{variant === 'inverse' && (
				<svg
					viewBox="0 0 1440 120"
					className="h-[60px] w-full md:h-[80px] lg:h-[100px]"
					preserveAspectRatio="none"
				>
					<path
						d="M0,120L48,112C96,104,192,88,288,80C384,72,480,72,576,77.3C672,83,768,93,864,96C960,99,1056,93,1152,85.3C1248,77,1344,67,1392,61.3L1440,56L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
						className={colors.primary}
					/>
				</svg>
			)}
		</div>
	)
}
