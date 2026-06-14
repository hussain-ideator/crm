'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createLead } from '../api'
import type { LeadFormValues } from '../schemas/lead'

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LeadFormValues) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
