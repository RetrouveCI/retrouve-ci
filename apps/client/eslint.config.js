import { config } from '@app/eslint-config/react-internal'

/** @type {import("eslint").Linter.Config} */
export default [...config, { ignores: ['.react-router/**', 'build/**'] }]
