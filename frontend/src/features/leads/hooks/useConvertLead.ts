'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { convertLead } from '../api'

export function useConvertLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => convertLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
