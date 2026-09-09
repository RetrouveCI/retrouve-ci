export function IvorianFlag({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 9 6"
			role="img"
			aria-label="Drapeau de la Côte d'Ivoire"
			className={className}
		>
			<rect width="3" height="6" fill="#F77F00" />
			<rect x="3" width="3" height="6" fill="#FFFFFF" />
			<rect x="6" width="3" height="6" fill="#009E60" />
		</svg>
	)
}
