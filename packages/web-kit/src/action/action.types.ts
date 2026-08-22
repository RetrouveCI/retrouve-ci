export type FormErrors = Record<string, { type: string; message: string }>

/**
 * `TData` carries a payload the caller cannot get any other way — the QR tokens
 * a generation returns, for instance. It defaults to `never`, so an action that
 * only reports an outcome still answers plain `{ success: true }`.
 */
export type ActionResult<TData = never> =
	| { success: true; data?: TData }
	| { success: false; errors?: FormErrors }
