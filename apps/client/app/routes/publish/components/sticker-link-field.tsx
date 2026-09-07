import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { QrCode } from 'lucide-react'
import type { LinkableSticker } from '../servers/publish.loader'
import type { PublishFormInput } from '../publish.schema'

interface StickerLinkFieldProps {
	control: Control<PublishFormInput>
	stickers: LinkableSticker[]
}

/** Radix has no empty item value, so « none » travels as a sentinel. */
const NO_STICKER = '__none__'

/**
 * Asked here and not at activation, where the mockup drew it: a sticker is
 * activated the day it arrives, long before its object is lost. Nothing is
 * drawn for a poster with none — an empty select is a dead button's twin.
 */
export function StickerLinkField({ control, stickers }: StickerLinkFieldProps) {
	if (!stickers.length) return null

	return (
		<Controller
			control={control}
			name="stickerCode"
			render={({ field }) => (
				<div className="space-y-1.5">
					<InputLabel htmlFor="stickerCode">
						Cet objet porte-t-il un de vos stickers&nbsp;?
					</InputLabel>
					<Select
						value={field.value || NO_STICKER}
						onValueChange={value => {
							// Radix fires an empty value on mount, wiping a restored draft.
							if (!value) return

							field.onChange(value === NO_STICKER ? '' : value)
						}}
						onOpenChange={open => !open && field.onBlur()}
					>
						<SelectTrigger
							id="stickerCode"
							className="h-control text-field w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={NO_STICKER}>Aucun sticker</SelectItem>
							{stickers.map(sticker => (
								<SelectItem key={sticker.code} value={sticker.code}>
									{sticker.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
						<QrCode className="mt-0.5 h-3.5 w-3.5 shrink-0" />
						<span>
							La personne qui scannera ce sticker verra que l&apos;objet est
							déclaré perdu, et pourra ouvrir votre annonce.
						</span>
					</p>
				</div>
			)}
		/>
	)
}
