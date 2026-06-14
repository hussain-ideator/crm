'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createDeal } from '../api'
import type { CreateDealInput } from '../types'

export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDealInput) => createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })
}
