export * from './field-error'
export * from './input-label'

// react-hook-form field wrappers. Built on `Controller` and the shadcn
// `ui/field.tsx` primitives; these are what forms must use.
export * from './form-input-field'
export * from './form-root-error'
export * from './form-textarea-field'

// Beware of `FieldError` above: this subpath re-exports the one that takes
// `errors: string[]`, while `@app/ui/components` exports the shadcn `Field`
// family one (`errors: Array<{ message?: string }>`). A `Controller`-based form
// wants the latter — import it from `@app/ui/components`, not from here.
