'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteDeal } from '../api'

export function useDeleteDeal(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteDeal(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['deal', id] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
