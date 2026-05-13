import { AuthLayout } from '@/components/admin/auth-layout'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return <AuthLayout>{children}</AuthLayout>
}
