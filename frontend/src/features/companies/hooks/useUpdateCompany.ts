'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateCompany, patchCompany } from '../api'
import type { CompanyFormValues } from '../schemas/company'

export function useUpdateCompany(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompanyFormValues) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', id] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function usePatchCompany(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CompanyFormValues>) => patchCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', id] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
