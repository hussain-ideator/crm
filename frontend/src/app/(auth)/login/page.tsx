import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/components/LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Already authenticated — skip the login form (FR-017).
  const cookieStore = await cookies()
  if (cookieStore.has('refresh_token')) {
    redirect('/')
  }

  const { next } = await searchParams

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-8 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in to CRM
        </h1>
        <LoginForm next={next} />
      </div>
    </div>
  )
}
