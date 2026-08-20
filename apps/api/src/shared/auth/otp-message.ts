export type OtpPurpose = 'sign-in' | 'password-reset'

const TEMPLATES: Record<OtpPurpose, (code: string) => string> = {
	'sign-in': code =>
		`RetrouveCI : votre code de verification est ${code}. Il expire dans 2 minutes. Ne le partagez avec personne.`,
	'password-reset': code =>
		`RetrouveCI : votre code de reinitialisation est ${code}. Il expire dans 2 minutes. Ne le partagez avec personne.`,
}

/**
 * Deliberately unaccented: a single accent pushes the SMS from GSM-7 to UCS-2,
 * which halves the segment budget from 160 characters to 70.
 */
export function buildOtpMessage(purpose: OtpPurpose, code: string): string {
	return TEMPLATES[purpose](code)
}
