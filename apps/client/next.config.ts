import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@retrouve-ci/ui'],
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
}

export default nextConfig
