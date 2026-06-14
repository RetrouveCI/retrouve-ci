import { config } from '@retrouve-ci/eslint-config/react-internal'

/** @type {import("eslint").Linter.Config} */
export default [...config, { ignores: ['.react-router/**'] }]
