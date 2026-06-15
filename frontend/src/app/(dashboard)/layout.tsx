import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
        <div className="flex items-center gap-6">
          <span className="font-semibold">CRM</span>
          <Link
            href="/companies"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Companies
          </Link>
          <Link
            href="/contacts"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Contacts
          </Link>
          <Link
            href="/leads"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Leads
          </Link>
          <Link
            href="/deals"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Deals
          </Link>
          <Link
            href="/activities"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Activities
          </Link>
        </div>
        <LogoutButton />
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  )
}
