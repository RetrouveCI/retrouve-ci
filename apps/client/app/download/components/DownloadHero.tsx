import Image from 'next/image'
import { Apple, Smartphone, QrCode, Bell, MapPin, CheckCircle2 } from 'lucide-react'

const stats = [
	{ value: '50K+', label: 'Utilisateurs' },
	{ value: '4.8', label: 'Note', suffix: '★' },
	{ value: '15K+', label: 'Objets retrouvés' },
]

export function DownloadHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary-green/6 absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-3xl" />
				<div className="bg-accent-orange/5 absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full blur-3xl" />
			</div>

			<div className="relative container mx-auto px-4 pt-14 pb-12">
				<div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
					<div className="text-center md:text-left">
						<div className="bg-muted text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
							<Smartphone className="h-3.5 w-3.5" />
							Application mobile — Bientôt disponible
						</div>
						<h1 className="mb-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
							Retrouvez vos objets{' '}
							<span className="text-primary-green">plus vite</span>
						</h1>
						<p className="text-muted-foreground mx-auto mb-8 max-w-md text-base leading-relaxed md:mx-0 md:text-lg">
							Scannez les stickers QR, recevez des alertes instantanées et gérez tous
							vos objets depuis votre téléphone.
						</p>

						<div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
							<button
								disabled
								className="bg-foreground text-background flex cursor-not-allowed items-center gap-3 rounded-xl px-5 py-3 opacity-60"
							>
								<Apple className="h-6 w-6 shrink-0" />
								<div className="text-left">
									<p className="text-[10px] tracking-widest uppercase opacity-70">
										Bientôt sur
									</p>
									<p className="text-sm font-semibold">App Store</p>
								</div>
							</button>
							<button
								disabled
								className="bg-primary-green flex cursor-not-allowed items-center gap-3 rounded-xl px-5 py-3 text-white opacity-60"
							>
								<Smartphone className="h-6 w-6 shrink-0" />
								<div className="text-left">
									<p className="text-[10px] tracking-widest uppercase opacity-70">
										Bientôt sur
									</p>
									<p className="text-sm font-semibold">Google Play</p>
								</div>
							</button>
						</div>

						<div className="flex items-center justify-center gap-8 border-t pt-6 md:justify-start">
							{stats.map(s => (
								<div key={s.label} className="text-center md:text-left">
									<p className="text-xl font-bold">
										{s.value}
										{s.suffix ?? ''}
									</p>
									<p className="text-muted-foreground text-xs">{s.label}</p>
								</div>
							))}
						</div>
					</div>

					<div className="relative flex justify-center">
						<div className="relative">
							<div className="bg-foreground relative h-[520px] w-[260px] rounded-[2.8rem] p-3 shadow-2xl">
								<div className="bg-background relative h-full w-full overflow-hidden rounded-[2.3rem]">
									<div className="bg-foreground absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl" />
									<div className="flex h-full flex-col gap-3 px-4 pt-9 pb-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<Image
													src="/logo.png"
													alt="logo"
													width={24}
													height={24}
													className="rounded-md"
												/>
												<span className="text-xs font-bold">RetrouveCI</span>
											</div>
											<div className="bg-muted h-6 w-6 rounded-full" />
										</div>
										<div className="bg-muted/40 border-primary-green/30 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed">
											<div className="bg-primary-green/10 flex h-12 w-12 items-center justify-center rounded-xl">
												<QrCode className="text-primary-green h-6 w-6" />
											</div>
											<p className="text-muted-foreground text-[10px]">
												Scanner un QR code
											</p>
											<div className="border-primary-green pointer-events-none absolute top-16 left-16 h-16 w-16 rounded-tl-lg border-t-2 border-l-2" />
											<div className="border-primary-green pointer-events-none absolute top-16 right-16 h-16 w-16 rounded-tr-lg border-t-2 border-r-2" />
										</div>
										<div className="border-primary-green/20 bg-primary-green/10 flex items-center gap-2 rounded-xl border px-3 py-2">
											<CheckCircle2 className="text-primary-green h-4 w-4 shrink-0" />
											<p className="text-[10px] font-medium">
												Objet retrouvé à Cocody !
											</p>
										</div>
										<div className="bg-muted/30 flex justify-around rounded-2xl p-1.5">
											{[QrCode, MapPin, Bell].map((Icon, i) => (
												<div
													key={i}
													className={`flex h-9 w-9 items-center justify-center rounded-xl ${i === 0 ? 'bg-primary-green' : ''}`}
												>
													<Icon
														className={`h-4 w-4 ${i === 0 ? 'text-white' : 'text-muted-foreground'}`}
													/>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
							<div className="bg-background animate-float absolute top-24 -left-14 rounded-xl border p-2.5 shadow-lg">
								<div className="flex items-center gap-2">
									<div className="bg-primary-green/10 flex h-7 w-7 items-center justify-center rounded-lg">
										<CheckCircle2 className="text-primary-green h-3.5 w-3.5" />
									</div>
									<div>
										<p className="text-[10px] font-semibold">Retrouvé !</p>
										<p className="text-muted-foreground text-[9px]">Il y a 2 min</p>
									</div>
								</div>
							</div>
							<div className="bg-background animate-float-delayed absolute -right-12 bottom-28 rounded-xl border p-2.5 shadow-lg">
								<div className="flex items-center gap-2">
									<div className="bg-accent-orange/10 flex h-7 w-7 items-center justify-center rounded-lg">
										<Bell className="text-accent-orange h-3.5 w-3.5" />
									</div>
									<div>
										<p className="text-[10px] font-semibold">Alerte</p>
										<p className="text-muted-foreground text-[9px]">Yopougon</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
