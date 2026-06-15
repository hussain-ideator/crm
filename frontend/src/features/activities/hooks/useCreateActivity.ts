'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createActivity } from '../api'
import type { Activity, CreateActivityInput } from '../types'

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(input),
    onSuccess: (activity: Activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity.content_type && activity.object_id != null) {
        queryClient.invalidateQueries({
          queryKey: ['activities', { content_type: activity.content_type, object_id: activity.object_id }],
        })
      }
    },
  })
}
