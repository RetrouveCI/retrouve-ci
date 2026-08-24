import { createApiFetch } from '@app/web-kit/api'
import { apiUrl } from '@/shared/helpers/env'

export { ApiError } from '@app/web-kit/api'

export const apiFetch = createApiFetch({ baseUrl: apiUrl })
