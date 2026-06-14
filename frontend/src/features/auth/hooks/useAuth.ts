'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { setAccessToken } from '@/lib/auth'
import { login } from '../api'

export function useLogin(next?: string) {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess(data) {
      setAccessToken(data.access)
      router.push(next ?? '/')
    },
  })
}
