import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from '@/features/auth/components/LogoutButton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies()

  if (!cookieStore.has('refresh_token')) {
    // Include the intended destination so login can redirect back (FR-015, FR-016).
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? '/'
    redirect(`/login?next=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex items-center justify-between border-b p-4">
        <span className="font-semibold">CRM</span>
        <LogoutButton />
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
