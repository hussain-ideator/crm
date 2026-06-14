'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteLead } from '../api'

export function useDeleteLead(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteLead(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['lead', id] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
