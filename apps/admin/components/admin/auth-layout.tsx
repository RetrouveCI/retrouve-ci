export function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="from-primary/5 via-background to-accent/5 flex min-h-screen items-center justify-center bg-linear-to-br p-4">
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
				<div className="bg-accent/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
			</div>
			{children}
		</div>
	)
}
