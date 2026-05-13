import { AuthLayout } from '@/components/admin/auth-layout'

export default function AuthPagesLayout({ children }: { children: React.ReactNode }) {
	return <AuthLayout>{children}</AuthLayout>
}
