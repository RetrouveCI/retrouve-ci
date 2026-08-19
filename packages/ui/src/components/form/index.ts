export * from './field-error'
export * from './input-label'

// react-hook-form field wrappers (E7 target). Built on `Controller` and the
// shadcn `ui/field.tsx` primitives; these are what new and migrated forms must
// use.
export * from './form-input-field'
export * from './form-root-error'
export * from './form-textarea-field'

// Conform-based wrappers — legacy, kept only until their last consumer is
// migrated to react-hook-form (E7.2 → E7.6), then removed with the
// `@conform-to/*` dependencies. Do not use them in new code.
//
// Beware of `FieldError` above: this subpath re-exports the Conform-era one
// (`errors: string[]`), while `@app/ui/components` exports the shadcn `Field`
// family one (`errors: Array<{ message?: string }>`). Migrated forms want the
// latter — import it from `@app/ui/components`, not from here.
export * from './input-field'
export * from './textarea-field'
