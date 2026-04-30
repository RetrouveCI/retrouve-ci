import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
	Apple,
	Smartphone,
	QrCode,
	Bell,
	Shield,
	Zap,
	MapPin,
	Clock,
	ArrowRight,
	CheckCircle2,
	Star,
} from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
	title: "Télécharger l'app — RetrouveCI",
	description:
		"Téléchargez l'application RetrouveCI pour iOS et Android. Scannez les QR codes et gérez vos objets facilement.",
}

export default function DownloadPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* ── Hero ── */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[var(--primary-green)]/6 blur-3xl" />
						<div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
					</div>

					<div className="relative container mx-auto px-4 pt-14 pb-12">
						<div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
							{/* Left */}
							<div className="text-center md:text-left">
								<div className="bg-muted text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
									<Smartphone className="h-3.5 w-3.5" />
									Application mobile — Bientôt disponible
								</div>
								<h1 className="mb-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
									Retrouvez vos objets{' '}
									<span className="text-[var(--primary-green)]">plus vite</span>
								</h1>
								<p className="text-muted-foreground mx-auto mb-8 max-w-md text-base leading-relaxed md:mx-0 md:text-lg">
									Scannez les stickers QR, recevez des alertes instantanées et
									gérez tous vos objets depuis votre téléphone.
								</p>

								{/* Store buttons */}
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
										className="flex cursor-not-allowed items-center gap-3 rounded-xl bg-[var(--primary-green)] px-5 py-3 text-white opacity-60"
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

								{/* Mini stats */}
								<div className="flex items-center justify-center gap-8 border-t pt-6 md:justify-start">
									{[
										{ value: '50K+', label: 'Utilisateurs' },
										{ value: '4.8', label: 'Note', suffix: '★' },
										{ value: '15K+', label: 'Objets retrouvés' },
									].map(s => (
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

							{/* Right — phone mockup */}
							<div className="relative flex justify-center">
								<div className="relative">
									<div className="bg-foreground relative h-[520px] w-[260px] rounded-[2.8rem] p-3 shadow-2xl">
										<div className="bg-background relative h-full w-full overflow-hidden rounded-[2.3rem]">
											<div className="bg-foreground absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl" />
											<div className="flex h-full flex-col gap-3 px-4 pt-9 pb-4">
												{/* App header */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-1.5">
														<Image
															src="/logo.png"
															alt="logo"
															width={24}
															height={24}
															className="rounded-md"
														/>
														<span className="text-xs font-bold">
															RetrouveCI
														</span>
													</div>
													<div className="bg-muted h-6 w-6 rounded-full" />
												</div>
												{/* Scanner */}
												<div className="bg-muted/40 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--primary-green)]/30">
													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10">
														<QrCode className="h-6 w-6 text-[var(--primary-green)]" />
													</div>
													<p className="text-muted-foreground text-[10px]">
														Scanner un QR code
													</p>
													{/* Scan corners */}
													<div className="pointer-events-none absolute top-16 left-16 h-16 w-16 rounded-tl-lg border-t-2 border-l-2 border-[var(--primary-green)]" />
													<div className="pointer-events-none absolute top-16 right-16 h-16 w-16 rounded-tr-lg border-t-2 border-r-2 border-[var(--primary-green)]" />
												</div>
												{/* Notification pill */}
												<div className="flex items-center gap-2 rounded-xl border border-[var(--primary-green)]/20 bg-[var(--primary-green)]/10 px-3 py-2">
													<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary-green)]" />
													<p className="text-[10px] font-medium">
														Objet retrouvé à Cocody !
													</p>
												</div>
												{/* Bottom nav */}
												<div className="bg-muted/30 flex justify-around rounded-2xl p-1.5">
													{[QrCode, MapPin, Bell].map((Icon, i) => (
														<div
															key={i}
															className={`flex h-9 w-9 items-center justify-center rounded-xl ${i === 0 ? 'bg-[var(--primary-green)]' : ''}`}
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
									{/* Floating badge */}
									<div className="bg-background animate-float absolute top-24 -left-14 rounded-xl border p-2.5 shadow-lg">
										<div className="flex items-center gap-2">
											<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-green)]/10">
												<CheckCircle2 className="h-3.5 w-3.5 text-[var(--primary-green)]" />
											</div>
											<div>
												<p className="text-[10px] font-semibold">Retrouvé !</p>
												<p className="text-muted-foreground text-[9px]">
													Il y a 2 min
												</p>
											</div>
										</div>
									</div>
									<div className="bg-background animate-float-delayed absolute -right-12 bottom-28 rounded-xl border p-2.5 shadow-lg">
										<div className="flex items-center gap-2">
											<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-orange)]/10">
												<Bell className="h-3.5 w-3.5 text-[var(--accent-orange)]" />
											</div>
											<div>
												<p className="text-[10px] font-semibold">Alerte</p>
												<p className="text-muted-foreground text-[9px]">
													Yopougon
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── Bento Features ── */}
				<section className="py-16 md:py-24">
					<div className="container mx-auto px-4">
						<div className="mb-10 text-center">
							<h2 className="mb-3 text-3xl font-bold md:text-4xl">
								Tout ce dont vous avez besoin
							</h2>
							<p className="text-muted-foreground mx-auto max-w-md">
								Une app pensée pour retrouver vos objets rapidement et en toute
								sécurité.
							</p>
						</div>

						{/* Bento grid */}
						<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{/* Large — Scan QR */}
							<div className="group bg-background rounded-2xl border p-8 transition-all duration-300 hover:border-[var(--primary-green)]/40 hover:shadow-lg sm:col-span-2">
								<div className="mb-6 flex items-start justify-between">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-transform duration-300 group-hover:scale-110">
										<QrCode className="h-6 w-6 text-[var(--primary-green)]" />
									</div>
									<span className="text-muted-foreground rounded-full border px-2 py-1 text-xs">
										Phare
									</span>
								</div>
								<h3 className="mb-2 text-xl font-bold">Scan QR instantané</h3>
								<p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
									Pointez votre caméra vers n&apos;importe quel sticker
									RetrouveCI pour identifier l&apos;objet et contacter son
									propriétaire en moins de 3 secondes.
								</p>
							</div>

							{/* Notifications */}
							<div className="group bg-background rounded-2xl border p-6 transition-all duration-300 hover:border-[var(--accent-orange)]/40 hover:shadow-lg">
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10 transition-transform duration-300 group-hover:scale-110">
									<Bell className="h-6 w-6 text-[var(--accent-orange)]" />
								</div>
								<h3 className="mb-2 font-bold">Alertes push</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Notifié immédiatement quand votre objet est scanné.
								</p>
							</div>

							{/* Shield */}
							<div className="group bg-background rounded-2xl border p-6 transition-all duration-300 hover:border-[var(--primary-green)]/40 hover:shadow-lg">
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-transform duration-300 group-hover:scale-110">
									<Shield className="h-6 w-6 text-[var(--primary-green)]" />
								</div>
								<h3 className="mb-2 font-bold">Contact sécurisé</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Via WhatsApp, sans révéler votre numéro.
								</p>
							</div>

							{/* Offline */}
							<div className="group bg-background rounded-2xl border p-6 transition-all duration-300 hover:border-[var(--primary-green)]/40 hover:shadow-lg">
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-transform duration-300 group-hover:scale-110">
									<Zap className="h-6 w-6 text-[var(--primary-green)]" />
								</div>
								<h3 className="mb-2 font-bold">Mode hors-ligne</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Vos stickers accessibles même sans connexion.
								</p>
							</div>

							{/* Coverage — spans 1 col */}
							<div className="group rounded-2xl border bg-[var(--primary-green)] p-6 text-white transition-all duration-300 hover:shadow-lg">
								<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
									<MapPin className="h-6 w-6 text-white" />
								</div>
								<h3 className="mb-2 font-bold">Toute la Côte d&apos;Ivoire</h3>
								<p className="text-sm leading-relaxed text-white/80">
									Couverture nationale, de Abidjan à Bouaké.
								</p>
							</div>

							{/* Rating */}
							<div className="group bg-background flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:border-[var(--accent-orange)]/40 hover:shadow-lg">
								<div className="mb-4 flex items-center gap-1">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className="h-5 w-5 fill-[var(--accent-orange)] text-[var(--accent-orange)]"
										/>
									))}
								</div>
								<blockquote className="text-muted-foreground mb-4 text-sm leading-relaxed italic">
									&ldquo;J&apos;ai retrouvé mon téléphone en 20 minutes grâce à
									RetrouveCI. Incroyable !&rdquo;
								</blockquote>
								<p className="text-xs font-medium">— Kouamé A., Abidjan</p>
							</div>
						</div>
					</div>
				</section>

				{/* ── Steps ── */}
				<section className="bg-muted/30 border-y py-16 md:py-20">
					<div className="container mx-auto px-4">
						<div className="mb-10 text-center">
							<h2 className="mb-3 text-3xl font-bold">Comment ça marche ?</h2>
							<p className="text-muted-foreground mx-auto max-w-md">
								Trois étapes pour protéger vos objets.
							</p>
						</div>
						<div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
							{[
								{
									step: '01',
									icon: Smartphone,
									title: "Téléchargez l'app",
									desc: "Installez RetrouveCI depuis l'App Store ou Google Play.",
								},
								{
									step: '02',
									icon: QrCode,
									title: 'Collez vos stickers',
									desc: "Placez les stickers QR sur vos objets et activez-les dans l'app.",
								},
								{
									step: '03',
									icon: Bell,
									title: 'Restez serein',
									desc: 'Recevez des alertes dès que votre sticker est scanné.',
								},
							].map((item, i) => (
								<div
									key={i}
									className="bg-background relative rounded-2xl border p-6 text-center"
								>
									<div className="text-muted-foreground/10 mb-3 text-5xl font-bold">
										{item.step}
									</div>
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-green)]/10">
										<item.icon className="h-6 w-6 text-[var(--primary-green)]" />
									</div>
									<h3 className="mb-2 font-semibold">{item.title}</h3>
									<p className="text-muted-foreground text-sm">{item.desc}</p>
									{i < 2 && (
										<ArrowRight className="text-muted-foreground/30 absolute top-1/2 -right-3 z-10 hidden h-5 w-5 -translate-y-1/2 md:block" />
									)}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── CTA ── */}
				<section className="py-16 md:py-24">
					<div className="container mx-auto px-4">
						<div className="bg-background relative mx-auto max-w-2xl overflow-hidden rounded-2xl border p-10 text-center">
							<div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[var(--primary-green)]/5 blur-2xl" />
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent-orange)]/20 bg-[var(--accent-orange)]/10 px-3 py-1 text-xs font-medium text-[var(--accent-orange)]">
								<Clock className="h-3.5 w-3.5" />
								En attendant l&apos;application mobile
							</div>
							<h2 className="mb-3 text-2xl font-bold md:text-3xl">
								Utilisez la version web
							</h2>
							<p className="text-muted-foreground mx-auto mb-8 max-w-sm">
								Consultez les annonces, publiez vos objets et commandez vos
								stickers QR dès maintenant.
							</p>
							<div className="flex flex-col justify-center gap-3 sm:flex-row">
								<Button
									asChild
									size="lg"
									className="h-11 rounded-xl bg-[var(--primary-green)] px-6 text-white hover:bg-[var(--primary-green-dark)]"
								>
									<Link href="/annonces" className="gap-2">
										Voir les annonces
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="h-11 rounded-xl px-6"
								>
									<Link href="/stickers">Commander des stickers</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
