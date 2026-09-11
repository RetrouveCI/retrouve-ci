/**
 * Re-exported so the call sites keep their path. The rule lives in `@app/auth`,
 * which owns the `admin()` plugin that defines the roles — and which reads them
 * itself now, to refuse a sign-in on an instance an account has no role for.
 */
export { hasRole } from '@app/auth'
