'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateLead } from '../api'
import type { LeadFormValues } from '../schemas/lead'

export function useUpdateLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<LeadFormValues>) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
