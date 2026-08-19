export type FormErrors = Record<string, { type: string; message: string }>

export type ActionResult =
	| { success: true }
	| { success: false; errors?: FormErrors }
