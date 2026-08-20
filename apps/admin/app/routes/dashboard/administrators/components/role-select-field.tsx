import {
	Controller,
	type Control,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import {
	Field,
	FieldError,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'

const ROLE_OPTIONS = [
	{ value: 'admin', label: 'Administrateur' },
	{ value: 'moderator', label: 'Modérateur' },
]

interface RoleSelectFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, unknown, TTransformedValues>
	name: TName
	disabled?: boolean
}

/** Shared by the creation and the role-change dialogs, which both hand it a
 * field holding one of `editableRoleSchema`'s two values. */
export function RoleSelectField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	control,
	name,
	disabled,
}: RoleSelectFieldProps<TFieldValues, TName, TTransformedValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name}>Rôle</FieldLabel>
					<Select
						value={String(field.value ?? '')}
						onValueChange={field.onChange}
						onOpenChange={open => !open && field.onBlur()}
						disabled={disabled}
					>
						<SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
							<SelectValue placeholder="Sélectionner un rôle" />
						</SelectTrigger>
						<SelectContent>
							{ROLE_OPTIONS.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{fieldState.error && <FieldError errors={[fieldState.error]} />}
				</Field>
			)}
		/>
	)
}
