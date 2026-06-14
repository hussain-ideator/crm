'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateDeal } from '../api'
import type { UpdateDealInput } from '../types'

export function useUpdateDeal(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDealInput) => updateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
